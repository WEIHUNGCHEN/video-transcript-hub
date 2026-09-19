import { fileURLToPath, URL } from "node:url";

import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// Plain Vite + React SPA. `vite build` emits a static bundle to dist/, which
// Vercel serves directly; vercel.json rewrites unknown paths to index.html so
// deep links like /app resolve client-side.
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  server: {
    host: true,
    port: 8080,
  },
  build: {
    outDir: "dist",
  },
});
