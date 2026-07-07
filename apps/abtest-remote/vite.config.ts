import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import { federation } from "@module-federation/vite";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { viteDevServerNetwork } from "../../viteDevServer";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "../..");

export default defineConfig(({ mode }) => {
  const env = {
    ...loadEnv(mode, repoRoot, ""),
    ...loadEnv(mode, process.cwd(), ""),
  };
  const port = Number(env.VITE_ABTEST_REMOTE_PORT ?? 5101);
  const devNetwork = viteDevServerNetwork(env);

  return {
    base: "/remote/",
    plugins: [
      react(),
      federation({
        name: "abtest_remote",
        filename: "remoteEntry.js",
        // Désactivation de la génération de dts en dev pour éviter les erreurs IPC
        dts: false,
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
      ...devNetwork,
      port,
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
  };
});
