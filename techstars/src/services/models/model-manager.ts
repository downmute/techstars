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

  for (let i = 0; i < MODEL_REGISTRY.length; i++) {
    const model = MODEL_REGISTRY[i];
    const path = getModelPath(model.filename);

    // Skip if already downloaded
    if (await hasUsableModelFile(model)) {
      const modelBytes = model.sizeMb * 1024 * 1024;
      downloadedBytes += modelBytes;
      onProgress({
        modelKey: model.key,
        modelDescription: model.description,
        modelIndex: i + 1,
        totalModels: MODEL_REGISTRY.length,
        modelBytesWritten: modelBytes,
        modelTotalBytes: modelBytes,
        overallPercent: Math.round((downloadedBytes / totalBytes) * 100),
        estimatedSecondsRemaining: null,
      });
      continue;
    }

    const existingInfo = await FileSystem.getInfoAsync(path);
    if (existingInfo.exists) {
      await FileSystem.deleteAsync(path, { idempotent: true });
    }

    if (signal?.cancelled) {
      return { success: false, error: 'Download cancelled.' };
    }

    try {
      const modelStartBytes = downloadedBytes;

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

          onProgress({
            modelKey: model.key,
            modelDescription: model.description,
            modelIndex: i + 1,
            totalModels: MODEL_REGISTRY.length,
            modelBytesWritten: modelWritten,
            modelTotalBytes: modelTotal,
            overallPercent: Math.min(
              99,
              Math.round((currentTotal / totalBytes) * 100)
            ),
            estimatedSecondsRemaining: eta ? Math.round(eta) : null,
          });
        }
      );

      await downloadResumable.downloadAsync();

      if (!(await hasUsableModelFile(model))) {
        await FileSystem.deleteAsync(path, { idempotent: true });
        return {
          success: false,
          error: `${model.description} downloaded, but the file looks incomplete. Please retry.`,
        };
      }

      downloadedBytes += model.sizeMb * 1024 * 1024;
    } catch (err) {
      // Clean up partial download
      const pathInfo = await FileSystem.getInfoAsync(path);
      if (pathInfo.exists) {
        await FileSystem.deleteAsync(path, { idempotent: true });
      }
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

  return { success: true };
}

export async function clearDownloadedModels(): Promise<void> {
  for (const model of MODEL_REGISTRY) {
    const path = getModelPath(model.filename);
    try {
      await FileSystem.deleteAsync(path, { idempotent: true });
    } catch {}
  }
}
