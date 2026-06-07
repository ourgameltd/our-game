import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ThemeProvider } from '@material-tailwind/react'
import App from './App.tsx'
import './styles/globals.css'

// iOS Safari ignores user-scalable=no in the viewport meta tag.
// Prevent pinch-to-zoom by intercepting multi-touch moves.
document.addEventListener('touchmove', (e) => {
  if (e.touches.length > 1) e.preventDefault();
}, { passive: false });

// Desktop trackpad pinch-to-zoom fires wheel events with ctrlKey.
document.addEventListener('wheel', (e) => {
  if (e.ctrlKey) e.preventDefault();
}, { passive: false });

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </StrictMode>,
)
