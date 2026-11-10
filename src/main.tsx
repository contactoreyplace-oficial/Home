import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { registerSW } from 'virtual:pwa-register';

// Register service worker for offline caching and Super PWA support in production
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  registerSW({ immediate: true });
}

createRoot(document.getElementById('root')!).render(<App />);

