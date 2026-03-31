import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { federation } from "@module-federation/vite";
import path from "node:path";

export default defineConfig({
  base: "/remote/",
  plugins: [
    react(),
    federation({
      name: "abtest_remote",
      filename: "remoteEntry.js",
      exposes: {
        "./AbTestSlot": "./src/AbTestSlot.tsx",
      },
      shared: {
        react: { singleton: true },
        "react-dom": { singleton: true },
      },
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  server: {
    port: 5001,
    strictPort: true,
    cors: true,
    headers: {
      "Access-Control-Allow-Origin": "*",
    },
  },
  build: {
    target: "chrome89",
    outDir: "dist",
  },
});
