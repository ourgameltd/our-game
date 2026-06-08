import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ThemeProvider } from '@material-tailwind/react'
import App from './App.tsx'
import './styles/globals.css'

// Desktop trackpad pinch-to-zoom fires wheel events with ctrlKey.
// Mobile pinch-to-zoom is blocked via CSS touch-action: pan-x pan-y on body (globals.css).
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
