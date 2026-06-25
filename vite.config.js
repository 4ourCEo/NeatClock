import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

/** Parser-inserted Plausible tag — dynamic JS injection breaks document.currentScript. */
function plausibleAnalytics(domain) {
  return {
    name: 'plausible-analytics',
    transformIndexHtml(html, ctx) {
      if (ctx.server) {
        return html.replace('<!-- PLAUSIBLE_SNIPPET -->', '')
      }
      const plausibleDomain = domain?.trim()
      if (!plausibleDomain) {
        return html.replace('<!-- PLAUSIBLE_SNIPPET -->', '')
      }
      const snippet = `<script defer data-domain="${plausibleDomain}" src="https://plausible.io/js/script.js"></script>`
      return html.replace('<!-- PLAUSIBLE_SNIPPET -->', snippet)
    },
  }
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '')
  return {
  plugins: [react(), tailwindcss(), plausibleAnalytics(env.VITE_PLAUSIBLE_DOMAIN)],
  server: {
    host: true,
    watch: {
      usePolling: true,
      interval: 100
    },
    hmr: {
      overlay: true
    }
  },
  test: {
    include: ['src/**/*.test.js'],
    exclude: ['e2e/**', 'node_modules/**'],
  },
  }
})
