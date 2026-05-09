import { useEffect } from 'react';
import { Platform } from 'react-native';

/**
 * Registers keyboard shortcuts for the app (web only).
 * @param {Object} handlers
 *   - onNewTask()       N key
 *   - onSearch()        / key (focus search)
 *   - onToggleFocus()   F key
 *   - onCloseModal()    Escape
 */
export function useKeyboardShortcuts({ onNewTask, onSearch, onToggleFocus, onCloseModal }) {
  useEffect(() => {
    if (Platform.OS !== 'web') return;

    const handler = (e) => {
      const tag = document.activeElement?.tagName?.toLowerCase();
      const isInput = tag === 'input' || tag === 'textarea';

      if (e.key === 'Escape') {
        onCloseModal?.();
        return;
      }
      // Don't fire shortcuts when user is typing
      if (isInput) return;

      switch (e.key.toLowerCase()) {
        case 'n': onNewTask?.();      break;
        case '/': e.preventDefault(); onSearch?.(); break;
        case 'f': onToggleFocus?.();  break;
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onNewTask, onSearch, onToggleFocus, onCloseModal]);
}
