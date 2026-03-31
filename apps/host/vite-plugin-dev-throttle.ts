import { createRequire } from "node:module";
import type { Connect } from "vite";
import type { Plugin } from "vite";

const require = createRequire(import.meta.url);
const { ThrottleGroup } = require("stream-throttle") as {
  ThrottleGroup: new (opts: { rate: number; chunksize?: number }) => {
    throttle: () => import("node:stream").Transform;
  };
};

/** Ne pas ralentir le client Vite / refresh (sinon le dev devient impraticable). */
function skipThrottle(url: string | undefined): boolean {
  if (!url) return true;
  const pathOnly = url.split("?")[0];
  return (
    pathOnly.startsWith("/@vite/") ||
    pathOnly.startsWith("/@react-refresh") ||
    pathOnly.startsWith("/@fs/")
  );
}

/**
 * En dev, limite le débit des réponses HTTP (même logique que le serveur Express).
 * À utiliser avec THROTTLE_KBPS dans le .env à la racine du monorepo quand on ouvre :5173.
 */
export function devBandwidthThrottle(kbps: number): Plugin {
  return {
    name: "dev-bandwidth-throttle",
    apply: "serve",
    enforce: "pre",
    configureServer(server) {
      if (!Number.isFinite(kbps) || kbps <= 0) return;

      const mw: Connect.HandleFunction = (req, res, next) => {
        if (skipThrottle(req.url, req.headers)) {
          next();
          return;
        }
        const bps = kbps * 1024;
        const group = new ThrottleGroup({ rate: bps });
        const throttle = group.throttle();
        throttle.pipe(res);
        res.write = throttle.write.bind(throttle) as unknown as typeof res.write;
        res.end = throttle.end.bind(throttle) as unknown as typeof res.end;
        next();
      };

      const stack = (server.middlewares as Connect.Server).stack;
      if (Array.isArray(stack)) {
        stack.unshift({ route: "", handle: mw });
      } else {
        server.middlewares.use(mw);
      }

      // eslint-disable-next-line no-console
      console.log(`[vite] THROTTLE_KBPS=${kbps} (dev — assets lents sauf /@vite & refresh)`);
    },
  };
}
