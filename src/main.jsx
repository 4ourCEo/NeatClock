import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

const themeClasses = [
  'theme-warm-sand', 'theme-sage-garden', 'theme-obsidian', 'theme-forest-moss',
  'theme-ink-stone', 'theme-blush-linen',
];

function applyInitialTheme() {
  const savedTheme = localStorage.getItem('neatclock_theme');
  const legacyDark = localStorage.getItem('neatclock_dark_mode') === 'true';
  const theme = savedTheme || (legacyDark ? 'theme-obsidian' : 'theme-warm-sand');
  document.documentElement.classList.remove(...themeClasses);
  document.body.classList.remove(...themeClasses);
  document.documentElement.classList.add(theme);
  document.body.classList.add(theme);
}

applyInitialTheme();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
