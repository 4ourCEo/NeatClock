import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'
import { initAnalytics } from './lib/analytics.js'
import { storageGet } from './lib/storage.js'
import { resolveTheme, THEME_CLASSES } from './lib/themes.js'

const themeClasses = THEME_CLASSES;

function applyInitialTheme() {
  const savedTheme = storageGet('neatclock_theme');
  const legacyDark = storageGet('neatclock_dark_mode') === 'true';
  const theme = resolveTheme(savedTheme, legacyDark);
  document.documentElement.classList.remove(...themeClasses);
  document.body.classList.remove(...themeClasses);
  document.documentElement.classList.add(theme);
  document.body.classList.add(theme);
}

applyInitialTheme();
initAnalytics();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)
