import { useEffect, useRef, useCallback } from 'react';

interface FocusableElement {
  id: string;
  ref: HTMLElement | null;
  group?: string;
  order?: number;
}

interface UseKeyboardNavigationOptions {
  enabled?: boolean;
  loop?: boolean;
  orientation?: 'horizontal' | 'vertical' | 'both';
  onEscape?: () => void;
  onEnter?: (element: HTMLElement) => void;
}

/**
 * Custom hook for managing keyboard navigation and focus
 * Implements US-110: Keyboard Navigation accessibility requirements
 */
export function useKeyboardNavigation(options: UseKeyboardNavigationOptions = {}) {
  const {
    enabled = true,
    loop = true,
    orientation = 'both',
    onEscape,
    onEnter,
  } = options;

  const focusableElements = useRef<FocusableElement[]>([]);
  const currentIndex = useRef(0);

  const registerElement = useCallback((id: string, element: HTMLElement | null, group?: string, order?: number) => {
    if (!element) {
      // Unregister
      focusableElements.current = focusableElements.current.filter((el) => el.id !== id);
      return;
    }

    const existing = focusableElements.current.findIndex((el) => el.id === id);
    if (existing >= 0) {
      focusableElements.current[existing] = { id, ref: element, group, order };
    } else {
      focusableElements.current.push({ id, ref: element, group, order });
    }

    // Sort by order if specified
    focusableElements.current.sort((a, b) => (a.order || 0) - (b.order || 0));
  }, []);

  const focusElement = useCallback((index: number) => {
    const elements = focusableElements.current;
    if (elements.length === 0) return;

    let targetIndex = index;
    if (loop) {
      targetIndex = ((index % elements.length) + elements.length) % elements.length;
    } else {
      targetIndex = Math.max(0, Math.min(index, elements.length - 1));
    }

    const element = elements[targetIndex];
    if (element?.ref) {
      element.ref.focus();
      currentIndex.current = targetIndex;
    }
  }, [loop]);

  const focusNext = useCallback(() => {
    focusElement(currentIndex.current + 1);
  }, [focusElement]);

  const focusPrevious = useCallback(() => {
    focusElement(currentIndex.current - 1);
  }, [focusElement]);

  const focusFirst = useCallback(() => {
    focusElement(0);
  }, [focusElement]);

  const focusLast = useCallback(() => {
    focusElement(focusableElements.current.length - 1);
  }, [focusElement]);

  const focusByGroup = useCallback((group: string, direction: 'next' | 'prev' = 'next') => {
    const groupElements = focusableElements.current.filter((el) => el.group === group);
    if (groupElements.length === 0) return;

    const currentElement = focusableElements.current[currentIndex.current];
    const currentGroupIndex = groupElements.findIndex((el) => el.id === currentElement?.id);

    let targetIndex: number;
    if (currentGroupIndex < 0) {
      targetIndex = direction === 'next' ? 0 : groupElements.length - 1;
    } else if (direction === 'next') {
      targetIndex = (currentGroupIndex + 1) % groupElements.length;
    } else {
      targetIndex = (currentGroupIndex - 1 + groupElements.length) % groupElements.length;
    }

    const target = groupElements[targetIndex];
    if (target?.ref) {
      target.ref.focus();
      currentIndex.current = focusableElements.current.findIndex((el) => el.id === target.id);
    }
  }, []);

  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Check if focus is within a form element that should handle its own navigation
      const activeElement = document.activeElement;
      const isInputField = activeElement instanceof HTMLInputElement ||
                          activeElement instanceof HTMLTextAreaElement ||
                          activeElement instanceof HTMLSelectElement;

      // Allow default behavior in input fields unless it's arrow key navigation
      if (isInputField && !['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        return;
      }

      switch (e.key) {
        case 'ArrowDown':
          if (orientation === 'vertical' || orientation === 'both') {
            e.preventDefault();
            focusNext();
          }
          break;
        case 'ArrowUp':
          if (orientation === 'vertical' || orientation === 'both') {
            e.preventDefault();
            focusPrevious();
          }
          break;
        case 'ArrowRight':
          if (orientation === 'horizontal' || orientation === 'both') {
            e.preventDefault();
            focusNext();
          }
          break;
        case 'ArrowLeft':
          if (orientation === 'horizontal' || orientation === 'both') {
            e.preventDefault();
            focusPrevious();
          }
          break;
        case 'Home':
          e.preventDefault();
          focusFirst();
          break;
        case 'End':
          e.preventDefault();
          focusLast();
          break;
        case 'Escape':
          if (onEscape) {
            e.preventDefault();
            onEscape();
          }
          break;
        case 'Enter':
        case ' ':
          if (onEnter && activeElement instanceof HTMLElement) {
            // Don't interfere with buttons' default behavior
            if (!(activeElement instanceof HTMLButtonElement)) {
              e.preventDefault();
              onEnter(activeElement);
            }
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [enabled, orientation, focusNext, focusPrevious, focusFirst, focusLast, onEscape, onEnter]);

  return {
    registerElement,
    focusNext,
    focusPrevious,
    focusFirst,
    focusLast,
    focusByGroup,
    focusElement,
  };
}

/**
 * Hook for skip links - allows users to skip to main content
 */
export function useSkipLinks() {
  const mainContentRef = useRef<HTMLElement | null>(null);
  const navigationRef = useRef<HTMLElement | null>(null);

  const skipToMain = useCallback(() => {
    if (mainContentRef.current) {
      mainContentRef.current.focus();
      mainContentRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  const skipToNavigation = useCallback(() => {
    if (navigationRef.current) {
      navigationRef.current.focus();
    }
  }, []);

  return {
    mainContentRef,
    navigationRef,
    skipToMain,
    skipToNavigation,
  };
}

/**
 * Hook for managing focus trap within a container (useful for modals)
 */
export function useFocusTrap(containerRef: React.RefObject<HTMLElement>, active: boolean = true) {
  useEffect(() => {
    if (!active || !containerRef.current) return;

    const container = containerRef.current;
    const focusableSelectors = [
      'a[href]',
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
    ].join(', ');

    const getFocusableElements = () => {
      return Array.from(container.querySelectorAll<HTMLElement>(focusableSelectors));
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      const focusableElements = getFocusableElements();
      if (focusableElements.length === 0) return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (e.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        // Tab
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };

    // Focus first element when trap becomes active
    const focusableElements = getFocusableElements();
    if (focusableElements.length > 0) {
      focusableElements[0].focus();
    }

    container.addEventListener('keydown', handleKeyDown);
    return () => container.removeEventListener('keydown', handleKeyDown);
  }, [containerRef, active]);
}

/**
 * Focus ring styles - use with inline styles or CSS
 */
export function getFocusRingStyles(color = '#00d4ff'): React.CSSProperties {
  return {
    position: 'absolute',
    inset: 0,
    pointerEvents: 'none',
    borderRadius: '0.5rem',
    boxShadow: `0 0 0 2px ${color}, 0 0 0 4px ${color}40`,
  };
}

/**
 * Keyboard shortcut reference data
 */
export const keyboardShortcuts = {
  global: [
    { key: '?', description: 'Show keyboard shortcuts help' },
    { key: 'Ctrl+K', description: 'Open command palette' },
    { key: 'F1-F5', description: 'Switch between views' },
    { key: 'F11', description: 'Toggle fullscreen' },
    { key: 'Tab', description: 'Cycle through views' },
    { key: 'Escape', description: 'Close dialogs/Cancel' },
  ],
  flight: [
    { key: 'Space', description: 'Pause/Resume mission' },
    { key: 'R', description: 'Return to Launch (RTL)' },
    { key: 'L', description: 'Land immediately' },
    { key: 'A', description: 'Toggle arm/disarm' },
    { key: 'G', description: 'Enter guided mode' },
    { key: '+/-', description: 'Zoom map in/out' },
    { key: 'C', description: 'Center map on vehicle' },
    { key: '1-9', description: 'Select vehicle' },
  ],
  plan: [
    { key: 'Delete', description: 'Delete selected waypoint' },
    { key: 'Ctrl+Z', description: 'Undo last action' },
    { key: 'Ctrl+Y', description: 'Redo last action' },
    { key: 'Ctrl+S', description: 'Save mission' },
    { key: 'Ctrl+O', description: 'Open mission' },
  ],
  analyze: [
    { key: 'Space', description: 'Play/Pause replay' },
    { key: 'Left/Right', description: 'Seek backward/forward' },
    { key: 'Home', description: 'Go to start' },
    { key: 'End', description: 'Go to end' },
    { key: '1-4', description: 'Set playback speed' },
  ],
};
