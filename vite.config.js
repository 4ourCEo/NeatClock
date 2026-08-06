import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

/** Parser-inserted Plausible tag — dynamic JS injection breaks document.currentScript. */
const PLAUSIBLE_SNIPPET = `<!-- Privacy-friendly analytics by Plausible -->
<script async src="https://plausible.io/js/pa-7V3YfWxV7OYX_X9davuMm.js"></script>
<script>
  window.plausible=window.plausible||function(){(plausible.q=plausible.q||[]).push(arguments)},plausible.init=plausible.init||function(i){plausible.o=i||{}};
  // Domain baked into the pa- script was mistyped as neatclok.pro — force the real site.
  plausible.init({ domain: 'neatclock.pro' })
</script>`

function plausibleAnalytics(enabled) {
  return {
    name: 'plausible-analytics',
    transformIndexHtml(html, ctx) {
      if (ctx.server || !enabled) {
        return html.replace('<!-- PLAUSIBLE_SNIPPET -->', '')
      }
      return html.replace('<!-- PLAUSIBLE_SNIPPET -->', PLAUSIBLE_SNIPPET)
    },
  }
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '')
  return {
  plugins: [react(), tailwindcss(), plausibleAnalytics(true)],
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
