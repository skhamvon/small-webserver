import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import { federation } from "@module-federation/vite";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { devBandwidthThrottle } from "./vite-plugin-dev-throttle";
import { ovhBareMetalStatic } from "./vite-plugin-ovh-static";
import { viteDevServerNetwork } from "../../viteDevServer";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ovhPublicRoot = path.resolve(__dirname, "public/ovh-bare-metal");
const repoRoot = path.resolve(__dirname, "../..");

export default defineConfig(({ mode }) => {
  const rootEnv = loadEnv(mode, repoRoot, "");
  const hostEnv = loadEnv(mode, process.cwd(), "");
  const env = { ...rootEnv, ...hostEnv };
  const hostPort = Number(env.VITE_HOST_PORT ?? 5173);
  const remotePort = Number(env.VITE_ABTEST_REMOTE_PORT ?? 5101);
  const remoteUrl =
    env.VITE_ABTEST_REMOTE_URL ||
    `http://localhost:${remotePort}/remote/remoteEntry.js`;
  const throttleKbps = Number(env.THROTTLE_KBPS ?? 0);
  const nodeServerPort = Number(env.PORT ?? 5000);
  const devNetwork = viteDevServerNetwork(env);

  return {
    plugins: [
      ovhBareMetalStatic(ovhPublicRoot),
      devBandwidthThrottle(throttleKbps),
      react(),
      federation({
        name: "host",
        // Pas de téléchargement de @mf-types.zip en dev (évite erreur si remote pas prêt ou URL différente)
        dts: false,
        remotes: {
          abtest_remote: {
            type: "module",
            entry: remoteUrl,
          },
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
      port: hostPort,
      strictPort: true,
      proxy: {
        "/api": {
          target: `http://127.0.0.1:${nodeServerPort}`,
          changeOrigin: true,
        },
      },
    },
    build: {
      target: "chrome89",
    },
  };
});
