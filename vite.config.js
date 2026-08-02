import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

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
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
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
  ...(mode === 'test' ? { esbuild: { jsx: 'automatic' } } : {}),
  test: {
    include: ['src/**/*.test.js', 'src/**/*.test.jsx'],
    exclude: ['e2e/**', 'node_modules/**'],
  },
  }
})
