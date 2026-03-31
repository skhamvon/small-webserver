import { createRequire } from "node:module";
import type { Request, Response, NextFunction } from "express";

const require = createRequire(import.meta.url);
const { ThrottleGroup } = require("stream-throttle") as {
  ThrottleGroup: new (opts: { rate: number; chunksize?: number }) => {
    throttle: () => import("node:stream").Transform;
  };
};

let runtimeKbps = 0;

export function setThrottleKbps(kbps: number) {
  runtimeKbps = Math.max(0, kbps);
}

export function getThrottleKbps() {
  return runtimeKbps;
}

/**
 * Limite le débit des réponses (octets/seconde) via stream-throttle.
 */
export function bandwidthThrottleMiddleware(
  getKbps: () => number
): (req: Request, res: Response, next: NextFunction) => void {
  return (req, res, next) => {
    const kbps = getKbps();
    if (kbps <= 0) {
      next();
      return;
    }
    if (req.path.startsWith("/__dev") || req.path === "/health") {
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
}
