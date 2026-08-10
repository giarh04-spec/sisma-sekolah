import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Suppress benign Vite dev-server HMR websocket errors in the preview sandbox
if (typeof window !== 'undefined') {
  const isViteError = (msg: any) => {
    const text = String(msg).toLowerCase();
    return text.includes('websocket') || text.includes('vite') || text.includes('hmr') || text.includes('web socket') || text.includes('closed without opened');
  };

  // Prevent console.error and console.warn from printing these benign errors
  const originalError = console.error;
  console.error = function (...args) {
    const isVite = args.some(arg => isViteError(arg) || (arg && typeof arg === 'object' && isViteError(arg.message)));
    if (isVite) return;
    originalError.apply(console, args);
  };

  const originalWarn = console.warn;
  console.warn = function (...args) {
    const isVite = args.some(arg => isViteError(arg) || (arg && typeof arg === 'object' && isViteError(arg.message)));
    if (isVite) return;
    originalWarn.apply(console, args);
  };

  window.addEventListener('unhandledrejection', (event) => {
    const reasonMsg = event.reason?.message || String(event.reason);
    if (isViteError(reasonMsg)) {
      event.preventDefault();
      event.stopPropagation();
    }
  });

  window.addEventListener('error', (event) => {
    const errorMsg = event.message || (event.error?.message) || '';
    if (isViteError(errorMsg)) {
      event.preventDefault();
      event.stopPropagation();
    }
  }, true);
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

