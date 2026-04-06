import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import purgeCss from "vite-plugin-purgecss"

export default defineConfig({
  base: "/TMS-client/",

  plugins: [
    react(),
    purgeCss({
      content: [
        "./index.html",
        "./src/**/*.{js,jsx,ts,tsx}"
      ],
      safelist: [
        /^dt-/,
        /^dataTables/,
        /^modal/,
        /^dropdown/,
        /^bk-/,
        /^ocean-/,
        /^perf-/,
        /^qt-/,
        "show",
        "active"
      ]
    })
  ],
  build: {
    chunkSizeWarningLimit: 1000,
    outDir: "dist",
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom", "react-router-dom", "jquery", "datatables.net-bs5"]
        }
      }
    }
  }
})