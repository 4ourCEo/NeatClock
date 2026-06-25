import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

/** Parser-inserted Plausible tag — dynamic JS injection breaks document.currentScript. */
function plausibleAnalytics() {
  return {
    name: 'plausible-analytics',
    transformIndexHtml(html, ctx) {
      if (ctx.server) {
        return html.replace('<!-- PLAUSIBLE_SNIPPET -->', '')
      }
      const domain = process.env.VITE_PLAUSIBLE_DOMAIN?.trim()
      if (!domain) {
        return html.replace('<!-- PLAUSIBLE_SNIPPET -->', '')
      }
      const snippet = `<script defer data-domain="${domain}" src="https://plausible.io/js/script.js"></script>`
      return html.replace('<!-- PLAUSIBLE_SNIPPET -->', snippet)
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), plausibleAnalytics()],
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
})
