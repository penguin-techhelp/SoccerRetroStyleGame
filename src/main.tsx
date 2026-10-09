import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { registerSW } from 'virtual:pwa-register';

// 1. Mount React application root first to ensure UI always loads instantly
createRoot(document.getElementById('root')!).render(<App />);

// 2. Continuous online update sync: ensures anyone connected to the internet always gets the latest version
if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  try {
    const updateSW = registerSW({
      immediate: true,
      onNeedRefresh() {
        // Automatically activate newest version and refresh
        updateSW(true);
      },
      onRegisterError(err) {
        console.warn('SW registration bypassed (e.g. iframe sandbox):', err);
      },
    });

    // Check for updates as soon as the device reconnects to the internet
    window.addEventListener('online', () => {
      updateSW(true);
    });

    // Check for updates whenever user returns to the game tab
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible' && navigator.onLine) {
        updateSW(true);
      }
    });

    // Periodic background check every 60 seconds while connected
    setInterval(() => {
      if (navigator.onLine) {
        updateSW(true);
      }
    }, 60000);

    // When the new version service worker activates, reload seamlessly to run latest game code
    let isReloading = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (!isReloading) {
        isReloading = true;
        window.location.reload();
      }
    });
  } catch (err) {
    console.warn('SW init error caught safely:', err);
  }
}
