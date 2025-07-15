import { useState, useRef, useCallback } from 'react';

export const useAppUI = () => {
  const [currentTotalProcessingTimeMs, setCurrentTotalProcessingTimeMs] = useState<number>(0);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState<boolean>(false);
  const currentQueryStartTimeRef = useRef<number | null>(null);

  const openSettingsModal = useCallback(() => {
    setIsSettingsModalOpen(true);
  }, []);

  const closeSettingsModal = useCallback(() => {
    setIsSettingsModalOpen(false);
  }, []);

  const startProcessingTimer = useCallback(() => {
    currentQueryStartTimeRef.current = performance.now();
    setCurrentTotalProcessingTimeMs(0);
  }, []);

  const stopProcessingTimer = useCallback(() => {
    if (currentQueryStartTimeRef.current) {
      setCurrentTotalProcessingTimeMs(performance.now() - currentQueryStartTimeRef.current);
    }
    currentQueryStartTimeRef.current = null;
  }, []);
  
  const updateProcessingTimer = useCallback(() => {
    if (currentQueryStartTimeRef.current) {
        setCurrentTotalProcessingTimeMs(performance.now() - currentQueryStartTimeRef.current);
    }
  }, []);

  return {
    currentTotalProcessingTimeMs,
    isSettingsModalOpen,
    openSettingsModal,
    closeSettingsModal,
    startProcessingTimer,
    stopProcessingTimer,
    updateProcessingTimer,
    currentQueryStartTimeRef,
  };
};