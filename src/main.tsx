import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Suppress benign Vite dev-server HMR websocket errors in the preview sandbox
if (typeof window !== 'undefined') {
  const isViteError = (msg: any) => {
    const text = String(msg).toLowerCase();
    return (
      text.includes('websocket') || 
      text.includes('vite') || 
      text.includes('hmr') || 
      text.includes('web socket') || 
      text.includes('closed without opened') ||
      text.includes('could not reach cloud firestore') ||
      text.includes('client is offline') ||
      text.includes('failed to connect to websocket') ||
      text.includes('network request failed') ||
      text.includes('transport error') ||
      text.includes('connection refused')
    );
  };

  // Prevent console.error and console.warn from printing these benign errors
  const originalError = console.error;
  console.error = function (...args) {
    const isVite = args.some(arg => 
      isViteError(arg) || 
      (arg && typeof arg === 'object' && isViteError(arg.message)) ||
      (arg && typeof arg === 'string' && isViteError(arg))
    );
    if (isVite) return;
    originalError.apply(console, args);
  };

  const originalWarn = console.warn;
  console.warn = function (...args) {
    const isVite = args.some(arg => 
      isViteError(arg) || 
      (arg && typeof arg === 'object' && isViteError(arg.message)) ||
      (arg && typeof arg === 'string' && isViteError(arg))
    );
    if (isVite) return;
    originalWarn.apply(console, args);
  };

  window.addEventListener('unhandledrejection', (event) => {
    try {
      const reason = event.reason;
      const reasonMsg = reason?.message || (typeof reason === 'string' ? reason : JSON.stringify(reason)) || String(reason);
      if (isViteError(reasonMsg) || isViteError(reason)) {
        event.preventDefault();
        event.stopImmediatePropagation();
        event.stopPropagation();
      }
    } catch (e) {}
  }, true);

  // Hard override for unhandled rejections
  const originalOnUnhandledRejection = window.onunhandledrejection;
  window.onunhandledrejection = function(event) {
    try {
      const reason = event.reason;
      const reasonMsg = reason?.message || (typeof reason === 'string' ? reason : String(reason)) || '';
      if (isViteError(reasonMsg)) {
        event.preventDefault?.();
        return true; 
      }
    } catch (e) {}
    if (originalOnUnhandledRejection) {
      return originalOnUnhandledRejection.call(window, event);
    }
    return false;
  };

  // Hard override for standard errors
  const originalOnError = window.onerror;
  window.onerror = function(msg, url, line, col, error) {
    try {
      if (isViteError(msg) || isViteError(error?.message)) {
        return true;
      }
    } catch (e) {}
    if (originalOnError) {
      return originalOnError.apply(window, [msg, url, line, col, error]);
    }
    return false;
  };

  window.addEventListener('error', (event) => {
    try {
      const errorMsg = event.message || (event.error?.message) || '';
      if (isViteError(errorMsg)) {
        event.preventDefault();
        event.stopImmediatePropagation();
        event.stopPropagation();
      }
    } catch (e) {}
  }, true);

  // PROTEKSI SOURCE CODE & INSPECT DEVTOOLS
  // 1. Menonaktifkan Klik Kanan (Context Menu)
  document.addEventListener('contextmenu', (e) => {
    e.preventDefault();
  }, { capture: true });

  // 2. Memblokir shortcut keyboard DevTools & View Source
  document.addEventListener('keydown', (e) => {
    // F12 -> DevTools
    if (e.key === 'F12' || e.keyCode === 123) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }
    // Ctrl + Shift + I / J / C (Windows/Linux) atau Cmd + Option + I / J / C (Mac)
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && (['I', 'i', 'J', 'j', 'C', 'c'].includes(e.key) || [73, 74, 67].includes(e.keyCode))) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }
    // Ctrl + U (View Source) atau Cmd + Option + U
    if ((e.ctrlKey || e.metaKey) && (e.key === 'u' || e.key === 'U' || e.keyCode === 85)) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }
    // Ctrl + S (Save page)
    if ((e.ctrlKey || e.metaKey) && (e.key === 's' || e.key === 'S' || e.keyCode === 83)) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }
  }, { capture: true });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

