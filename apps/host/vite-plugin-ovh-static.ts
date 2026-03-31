import fs from "node:fs";
import path from "node:path";
import type { Connect } from "vite";
import type { Plugin } from "vite";

function mimeFor(fp: string): string {
  const ext = path.extname(fp).toLowerCase();
  const map: Record<string, string> = {
    ".html": "text/html; charset=utf-8",
    ".js": "application/javascript",
    ".mjs": "application/javascript",
    ".css": "text/css",
    ".json": "application/json",
    ".svg": "image/svg+xml",
    ".png": "image/png",
    ".webp": "image/webp",
    ".ico": "image/x-icon",
    ".webmanifest": "application/manifest+json",
    ".woff2": "font/woff2",
    ".txt": "text/plain",
    ".map": "application/json",
  };
  return map[ext] ?? "application/octet-stream";
}

/**
 * En dev, le middleware « public » de Vite ignore les URLs absentes de publicFiles,
 * puis htmlFallback réécrit tout vers /index.html (SPA) → React Router renvoie vers /.
 * On insère ce handler en tête de pile (avant public + htmlFallback) pour servir
 * public/ovh-bare-metal comme site statique.
 */
export function ovhBareMetalStatic(ovhRoot: string): Plugin {
  return {
    name: "ovh-bare-metal-static",
    enforce: "pre",
    configureServer(server) {
      const ovhMw: Connect.HandleFunction = (req, res, next) => {
        const raw = req.url ?? "";
        if (!raw.startsWith("/ovh-bare-metal")) {
          next();
          return;
        }

        const pathOnly = raw.split("?")[0];
        if (pathOnly === "/ovh-bare-metal") {
          res.writeHead(301, { Location: "/ovh-bare-metal/" });
          res.end();
          return;
        }

        let rel = pathOnly.slice("/ovh-bare-metal".length) || "/";
        if (rel.endsWith("/")) {
          rel += "index.html";
        }

        const full = path.normalize(path.join(ovhRoot, rel));
        if (!full.startsWith(ovhRoot)) {
          next();
          return;
        }

        if (!fs.existsSync(full)) {
          next();
          return;
        }

        const st = fs.statSync(full);
        if (st.isDirectory()) {
          const idx = path.join(full, "index.html");
          if (!fs.existsSync(idx)) {
            next();
            return;
          }
          res.setHeader("Content-Type", "text/html; charset=utf-8");
          const s = fs.createReadStream(idx);
          s.on("error", next);
          s.pipe(res);
          return;
        }

        res.setHeader("Content-Type", mimeFor(full));
        const stream = fs.createReadStream(full);
        stream.on("error", next);
        stream.pipe(res);
      };

      const stack = (server.middlewares as Connect.Server).stack;
      if (Array.isArray(stack)) {
        stack.unshift({
          route: "",
          handle: ovhMw,
        });
      } else {
        server.middlewares.use(ovhMw);
      }
    },
  };
}
