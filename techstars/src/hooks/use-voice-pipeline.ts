import { useEffect, useState } from 'react';

import {
  startListening,
  stopListening,
  cancelTurn,
} from '@/services/voice/voice-pipeline';
import { initSTT } from '@/services/voice/stt-engine';
import { initTTS } from '@/services/voice/tts-engine';

let initialized = false;
let initPromise: Promise<void> | null = null;

async function initPipeline() {
  if (initialized) {
    return;
  }
  if (initPromise) {
    await initPromise;
    return;
  }

  initPromise = (async () => {
    await Promise.all([initSTT(), initTTS()]);
    initialized = true;
  })();

  try {
    await initPromise;
  } finally {
    initPromise = null;
  }
}

export function useVoicePipeline() {
  const [isListening, setIsListening] = useState(false);
  const [isPreparing, setIsPreparing] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function prepare() {
      setIsPreparing(true);
      await initPipeline();
      if (!cancelled) {
        setIsPreparing(false);
      }
    }

    void prepare();

    return () => {
      cancelled = true;
    };
  }, []);

  async function handleStartListening() {
    if (isPreparing) {
      return;
    }
    setIsListening(true);
    await startListening();
  }

  async function handleStopListening() {
    setIsListening(false);
    await stopListening();
  }

  function handleCancelTurn() {
    setIsListening(false);
    cancelTurn();
  }

  return {
    isListening,
    isPreparing,
    startListening: handleStartListening,
    stopListening: handleStopListening,
    cancelTurn: handleCancelTurn,
  };
}
