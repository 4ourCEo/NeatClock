import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

/** Parser-inserted GoatCounter tag — dynamic JS injection breaks document.currentScript. */
const ANALYTICS_SNIPPET = `<!-- Privacy-friendly analytics by GoatCounter -->
<script data-goatcounter="https://neatclock.goatcounter.com/count"
        async src="https://gc.zgo.at/count.js"></script>`

function analyticsInjector(enabled) {
  return {
    name: 'analytics-injector',
    transformIndexHtml(html, ctx) {
      if (ctx.server || !enabled) {
        return html.replace('<!-- ANALYTICS_SNIPPET -->', '')
      }
      return html.replace('<!-- ANALYTICS_SNIPPET -->', ANALYTICS_SNIPPET)
    },
  }
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  return {
  plugins: [react(), tailwindcss(), analyticsInjector(true)],
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
