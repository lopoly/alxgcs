import { useState, useEffect, useCallback } from 'react';

interface UseFullscreenOptions {
  onEnter?: () => void;
  onExit?: () => void;
}

interface UseFullscreenReturn {
  isFullscreen: boolean;
  enterFullscreen: (element?: HTMLElement) => Promise<void>;
  exitFullscreen: () => Promise<void>;
  toggleFullscreen: (element?: HTMLElement) => Promise<void>;
  isSupported: boolean;
}

export function useFullscreen(options: UseFullscreenOptions = {}): UseFullscreenReturn {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const isSupported =
    typeof document !== 'undefined' &&
    (document.fullscreenEnabled ||
      (document as unknown as { webkitFullscreenEnabled?: boolean }).webkitFullscreenEnabled ||
      false);

  const handleFullscreenChange = useCallback(() => {
    const fullscreenElement =
      document.fullscreenElement ||
      (document as unknown as { webkitFullscreenElement?: Element }).webkitFullscreenElement;

    const isNowFullscreen = !!fullscreenElement;
    setIsFullscreen(isNowFullscreen);

    if (isNowFullscreen) {
      options.onEnter?.();
    } else {
      options.onExit?.();
    }
  }, [options]);

  useEffect(() => {
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
    };
  }, [handleFullscreenChange]);

  const enterFullscreen = useCallback(async (element?: HTMLElement) => {
    const target = element || document.documentElement;

    try {
      if (target.requestFullscreen) {
        await target.requestFullscreen();
      } else if ((target as unknown as { webkitRequestFullscreen?: () => Promise<void> }).webkitRequestFullscreen) {
        await (target as unknown as { webkitRequestFullscreen: () => Promise<void> }).webkitRequestFullscreen();
      }
    } catch (error) {
      console.error('Failed to enter fullscreen:', error);
    }
  }, []);

  const exitFullscreen = useCallback(async () => {
    try {
      if (document.exitFullscreen) {
        await document.exitFullscreen();
      } else if ((document as unknown as { webkitExitFullscreen?: () => Promise<void> }).webkitExitFullscreen) {
        await (document as unknown as { webkitExitFullscreen: () => Promise<void> }).webkitExitFullscreen();
      }
    } catch (error) {
      console.error('Failed to exit fullscreen:', error);
    }
  }, []);

  const toggleFullscreen = useCallback(
    async (element?: HTMLElement) => {
      if (isFullscreen) {
        await exitFullscreen();
      } else {
        await enterFullscreen(element);
      }
    },
    [isFullscreen, enterFullscreen, exitFullscreen]
  );

  return {
    isFullscreen,
    enterFullscreen,
    exitFullscreen,
    toggleFullscreen,
    isSupported,
  };
}
