import * as FileSystem from 'expo-file-system/legacy';

import {
  MODEL_REGISTRY,
  type ModelSpec,
  TOTAL_MODEL_MB,
  getModelPath,
  getModelsDir,
} from './model-registry';

export interface DownloadProgress {
  modelKey: string;
  modelDescription: string;
  modelIndex: number;
  totalModels: number;
  modelBytesWritten: number;
  modelTotalBytes: number;
  overallPercent: number; // 0-100
  estimatedSecondsRemaining: number | null;
}

export type ProgressCallback = (progress: DownloadProgress) => void;

function formatMb(bytes: number): string {
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function emitProgress(
  onProgress: ProgressCallback,
  model: ModelSpec,
  modelIndex: number,
  totalModels: number,
  downloadedBytes: number,
  totalBytes: number,
  modelBytesWritten: number,
  modelTotalBytes: number,
  estimatedSecondsRemaining: number | null
) {
  onProgress({
    modelKey: model.key,
    modelDescription: model.description,
    modelIndex,
    totalModels,
    modelBytesWritten,
    modelTotalBytes,
    overallPercent: Math.min(
      99,
      Math.round((downloadedBytes / totalBytes) * 100)
    ),
    estimatedSecondsRemaining,
  });
}

function getMinimumValidBytes(model: ModelSpec): number {
  return Math.max(1024, Math.floor(model.sizeMb * 1024 * 1024 * 0.85));
}

async function hasUsableModelFile(model: ModelSpec): Promise<boolean> {
  const path = getModelPath(model.filename);
  const info = await FileSystem.getInfoAsync(path);
  const size = (info as FileSystem.FileInfo & { size?: number }).size ?? 0;
  if (!info.exists) {
    return false;
  }
  if (model.expectedBytes != null) {
    return size === model.expectedBytes;
  }
  return size >= getMinimumValidBytes(model);
}

// Check if all models are already downloaded
export async function areAllModelsDownloaded(): Promise<boolean> {
  for (const model of MODEL_REGISTRY) {
    if (!(await hasUsableModelFile(model))) {
      return false;
    }
  }
  return true;
}

// Check available storage (in bytes)
async function getFreeDiskSpace(): Promise<number | null> {
  try {
    const info = await FileSystem.getFreeDiskStorageAsync();
    return info;
  } catch {
    return null;
  }
}

export async function downloadAllModels(
  onProgress: ProgressCallback,
  signal?: { cancelled: boolean }
): Promise<{ success: boolean; error?: string }> {
  // Ensure models directory exists
  const dir = getModelsDir();
  const dirInfo = await FileSystem.getInfoAsync(dir);
  if (!dirInfo.exists) {
    await FileSystem.makeDirectoryAsync(dir, { intermediates: true });
  }

  // Check free space (need ~800MB minimum)
  const freeBytes = await getFreeDiskSpace();
  const requiredBytes = TOTAL_MODEL_MB * 1024 * 1024 * 1.1; // 10% buffer
  if (freeBytes !== null && freeBytes < requiredBytes) {
    return {
      success: false,
      error: `Not enough storage space. Please free up at least ${Math.ceil(requiredBytes / 1024 / 1024)} MB.`,
    };
  }

  const totalBytes = TOTAL_MODEL_MB * 1024 * 1024;
  let downloadedBytes = 0;
  const startTime = Date.now();
  const bytesPerSecHistory: number[] = [];
  const loggedPercents = new Set<string>();

  console.log(
    `[ModelDownload] Starting download of ${MODEL_REGISTRY.length} files (${formatMb(totalBytes)})`
  );

  for (let i = 0; i < MODEL_REGISTRY.length; i++) {
    const model = MODEL_REGISTRY[i];
    const path = getModelPath(model.filename);

    // Skip if already downloaded
    if (await hasUsableModelFile(model)) {
      const modelBytes = model.sizeMb * 1024 * 1024;
      downloadedBytes += modelBytes;
      console.log(
        `[ModelDownload] Reusing ${model.filename} (${i + 1}/${MODEL_REGISTRY.length}, ${formatMb(modelBytes)})`
      );
      emitProgress(
        onProgress,
        model,
        i + 1,
        MODEL_REGISTRY.length,
        downloadedBytes,
        totalBytes,
        modelBytes,
        modelBytes,
        null
      );
      continue;
    }

    const existingInfo = await FileSystem.getInfoAsync(path);
    if (existingInfo.exists) {
      console.log(`[ModelDownload] Removing stale file ${model.filename}`);
      await FileSystem.deleteAsync(path, { idempotent: true });
    }

    if (signal?.cancelled) {
      return { success: false, error: 'Download cancelled.' };
    }

    try {
      const modelStartBytes = downloadedBytes;
      const modelTotalBytes = model.expectedBytes ?? model.sizeMb * 1024 * 1024;

      console.log(
        `[ModelDownload] Downloading ${model.filename} (${i + 1}/${MODEL_REGISTRY.length}, ${formatMb(modelTotalBytes)})`
      );

      emitProgress(
        onProgress,
        model,
        i + 1,
        MODEL_REGISTRY.length,
        modelStartBytes,
        totalBytes,
        0,
        modelTotalBytes,
        null
      );

      const downloadResumable = FileSystem.createDownloadResumable(
        model.url,
        path,
        {},
        (downloadSnapshot) => {
          if (signal?.cancelled) return;

          const modelWritten = downloadSnapshot.totalBytesWritten;
          const modelTotal = downloadSnapshot.totalBytesExpectedToWrite;
          const currentTotal = modelStartBytes + modelWritten;

          // Rolling average bytes/sec
          const elapsed = (Date.now() - startTime) / 1000;
          if (elapsed > 0) {
            const bps = currentTotal / elapsed;
            bytesPerSecHistory.push(bps);
            if (bytesPerSecHistory.length > 10) bytesPerSecHistory.shift();
          }
          const avgBps =
            bytesPerSecHistory.length > 0
              ? bytesPerSecHistory.reduce((a, b) => a + b) /
                bytesPerSecHistory.length
              : null;
          const remaining = totalBytes - currentTotal;
          const eta = avgBps && avgBps > 0 ? remaining / avgBps : null;
          const pctBucket = `${model.key}:${Math.floor(
            ((modelTotal > 0 ? modelWritten / modelTotal : 0) * 100) / 10
          ) * 10}`;

          if (!loggedPercents.has(pctBucket)) {
            loggedPercents.add(pctBucket);
            console.log(
              `[ModelDownload] ${model.filename} ${Math.round(
                modelTotal > 0 ? (modelWritten / modelTotal) * 100 : 0
              )}% (${formatMb(modelWritten)} / ${formatMb(modelTotal)})`
            );
          }

          emitProgress(
            onProgress,
            model,
            i + 1,
            MODEL_REGISTRY.length,
            currentTotal,
            totalBytes,
            modelWritten,
            modelTotal,
            eta ? Math.round(eta) : null
          );
        }
      );

      await downloadResumable.downloadAsync();

      if (!(await hasUsableModelFile(model))) {
        console.warn(
          `[ModelDownload] ${model.filename} failed validation after download. Deleting and retrying later.`
        );
        await FileSystem.deleteAsync(path, { idempotent: true });
        return {
          success: false,
          error: `${model.description} downloaded, but the file looks incomplete. Please retry.`,
        };
      }

      downloadedBytes += model.sizeMb * 1024 * 1024;
      console.log(
        `[ModelDownload] Finished ${model.filename} (${i + 1}/${MODEL_REGISTRY.length})`
      );
      emitProgress(
        onProgress,
        model,
        i + 1,
        MODEL_REGISTRY.length,
        downloadedBytes,
        totalBytes,
        modelTotalBytes,
        modelTotalBytes,
        null
      );
    } catch (err) {
      // Clean up partial download
      const pathInfo = await FileSystem.getInfoAsync(path);
      if (pathInfo.exists) {
        await FileSystem.deleteAsync(path, { idempotent: true });
      }
      console.error(
        `[ModelDownload] Failed ${model.filename}: ${String(err)}`
      );
      return {
        success: false,
        error: `Failed to download ${model.description}: ${String(err)}`,
      };
    }
  }

  onProgress({
    modelKey: 'done',
    modelDescription: 'All models ready',
    modelIndex: MODEL_REGISTRY.length,
    totalModels: MODEL_REGISTRY.length,
    modelBytesWritten: totalBytes,
    modelTotalBytes: totalBytes,
    overallPercent: 100,
    estimatedSecondsRemaining: 0,
  });

  console.log('[ModelDownload] All files downloaded successfully');

  return { success: true };
}

export async function clearDownloadedModels(): Promise<void> {
  const dir = getModelsDir();
  const dirInfo = await FileSystem.getInfoAsync(dir);

  if (dirInfo.exists) {
    try {
      console.log('[ModelDownload] Clearing vela_models directory');
      await FileSystem.deleteAsync(dir, { idempotent: true });
    } catch {}
  }

  for (const model of MODEL_REGISTRY) {
    const path = getModelPath(model.filename);
    try {
      await FileSystem.deleteAsync(path, { idempotent: true });
    } catch {}
  }
}
