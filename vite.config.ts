import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@/components": resolve(__dirname, "src/components"),
      "@/pages": resolve(__dirname, "src/pages"),
      "@/hooks": resolve(__dirname, "src/hooks"),
      "@/lib": resolve(__dirname, "src/lib"),
      "@/store": resolve(__dirname, "src/store"),
      "@/styles": resolve(__dirname, "src/styles"),
      "@/assets": resolve(__dirname, "src/assets"),
      "@/features": resolve(__dirname, "src/features"),
      "@/router": resolve(__dirname, "src/router"),
    },
  },
  server: {
    port: 3000,
    proxy: {
      "/api": {
        target: process.env.VITE_API_URL || "http://localhost:8000",
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
