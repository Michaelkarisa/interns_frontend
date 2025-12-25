import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { useAuthStore } from '@/Stores/authStore';
import { useAppStore } from '@/Api/favicon';

async function bootstrap() {
  // Init auth first (token, user)
  await useAuthStore.getState().initAuth();

  // Load branding (favicon, app name)
  await useAppStore.getState().loadCompany();
}

bootstrap();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
