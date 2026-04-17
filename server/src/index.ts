import express from "express";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";
import { bandwidthThrottleMiddleware, getThrottleKbps, setThrottleKbps } from "./throttle.js";
import { attachBackendAbtestLabRoute } from "./abtestBackendLab.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.join(__dirname, "../..");

dotenv.config({ path: path.join(repoRoot, ".env") });
dotenv.config({ path: path.join(repoRoot, ".env.local"), override: true });

const hostDist = path.join(repoRoot, "apps/host/dist");
const remoteDist = path.join(repoRoot, "apps/abtest-remote/dist");
const ovhFromDist = path.join(hostDist, "ovh-bare-metal");
const ovhFromPublic = path.join(repoRoot, "apps/host/public/ovh-bare-metal");
const ovhDir = fs.existsSync(path.join(ovhFromDist, "index.html"))
  ? ovhFromDist
  : fs.existsSync(path.join(ovhFromPublic, "index.html"))
    ? ovhFromPublic
    : null;

const PORT = Number(process.env.PORT ?? 5000);
const hostDevPort = Number(process.env.VITE_HOST_PORT ?? 5173);
const envThrottle = Number(process.env.THROTTLE_KBPS ?? 0);
setThrottleKbps(
  Number.isFinite(envThrottle) && envThrottle >= 0 ? envThrottle : 0
);

function effectiveKbps(): number {
  const r = getThrottleKbps();
  return Number.isFinite(r) && r >= 0 ? r : 0;
}

async function main() {
  const app = express();
  app.use(express.json({ limit: "8kb" }));
  app.use(bandwidthThrottleMiddleware(effectiveKbps));

  app.get("/health", (_req, res) => {
    res.json({ ok: true, throttleKbps: effectiveKbps() });
  });

  if (process.env.NODE_ENV !== "production") {
    app.get("/__dev/throttle", (_req, res) => {
      res.json({ throttleKbps: effectiveKbps() });
    });
    app.post("/__dev/throttle", (req, res) => {
      const kbps = Number(req.body?.throttleKbps ?? req.body?.kbps);
      if (!Number.isFinite(kbps) || kbps < 0) {
        res.status(400).json({ error: "Invalid throttleKbps" });
        return;
      }
      setThrottleKbps(kbps);
      res.json({ ok: true, throttleKbps: effectiveKbps() });
    });
  }

  attachBackendAbtestLabRoute(app);

  const hostReady = fs.existsSync(path.join(hostDist, "index.html"));
  const remoteReady = fs.existsSync(remoteDist);
  const ovhReady = Boolean(ovhDir && fs.existsSync(path.join(ovhDir, "index.html")));

  if (ovhReady) {
    app.get("/ovh-bare-metal", (_req, res) => {
      res.redirect(301, "/ovh-bare-metal/");
    });
  }

  if (remoteReady) {
    app.use(
      "/remote",
      express.static(remoteDist, { fallthrough: false, index: false })
    );
  }

  if (ovhReady && ovhDir) {
    app.use("/ovh-bare-metal", express.static(ovhDir));
  }

  if (hostReady) {
    app.use(express.static(hostDist));
    app.get("*", (req, res, next) => {
      res.sendFile(path.join(hostDist, "index.html"), (err) => {
        if (err) next(err);
      });
    });
  } else {
    const { createProxyMiddleware } = await import("http-proxy-middleware");
    app.use(
      "/",
      createProxyMiddleware({
        target: `http://127.0.0.1:${hostDevPort}`,
        changeOrigin: true,
        ws: true,
        on: {
          proxyReq(proxyReq) {
            proxyReq.setHeader("x-hackathon-proxy", "1");
          },
        },
      }),
    );
  }

  app.listen(PORT, () => {
    // eslint-disable-next-line no-console
    console.log(
      `[server] http://127.0.0.1:${PORT}  throttleKbps=${effectiveKbps()}  hostDist=${hostReady ? "yes" : "no (proxy→" + hostDevPort + ")"}  remote=${remoteReady ? "yes" : "no"}  ovh=${ovhReady ? "yes" : "no"}`
    );
  });
}

void main();
