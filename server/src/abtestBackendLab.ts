import type { Express, Request, Response } from "express";

const VISITOR_COOKIE = "lab_abtest_user_id";
const ONE_YEAR_S = 60 * 60 * 24 * 365;
const CAMPAIGN_ID_MIN = 10000;
const CAMPAIGN_ID_MAX = 99999;

function parseCookieHeader(header: string | undefined): Record<string, string> {
  const out: Record<string, string> = {};
  if (!header?.trim()) return out;
  for (const part of header.split(";")) {
    const eq = part.indexOf("=");
    if (eq <= 0) continue;
    const name = part.slice(0, eq).trim();
    const value = part.slice(eq + 1).trim();
    if (name) {
      try {
        out[name] = decodeURIComponent(value);
      } catch {
        out[name] = value;
      }
    }
  }
  return out;
}

function assignmentCookieName(campaignId: number): string {
  return `lab_ab_assignment_${campaignId}`;
}

function cookieAttr(name: string, value: string, maxAge: number): string {
  return `${name}=${encodeURIComponent(value)}; Path=/; Max-Age=${maxAge}; SameSite=Lax; HttpOnly`;
}

function abtestApiUrl(): string {
  const raw = process.env.ABTEST_API_URL?.trim();
  return raw && raw.length > 0 ? raw : "http://127.0.0.1:5002";
}

function backendDemoCampaignId(): number {
  const n = Number(process.env.ABTEST_BACKEND_DEMO_CAMPAIGN_ID ?? 10003);
  return Number.isInteger(n) && n >= CAMPAIGN_ID_MIN && n <= CAMPAIGN_ID_MAX ? n : 10003;
}

function queryParam(req: Request, name: string): string | undefined {
  const v = req.query[name];
  if (Array.isArray(v)) {
    const first = v[0];
    if (first === undefined || first === null || String(first) === "") return undefined;
    return String(first);
  }
  if (v === undefined || v === null) return undefined;
  const s = String(v);
  return s === "" ? undefined : s;
}

function parseNumericId(raw: string): number | null {
  const t = raw.trim();
  if (!/^\d+$/.test(t)) return null;
  const n = Number(t);
  return Number.isSafeInteger(n) ? n : null;
}

function isCampaignId(n: number): boolean {
  return Number.isInteger(n) && n >= CAMPAIGN_ID_MIN && n <= CAMPAIGN_ID_MAX;
}

function campaignIdFromRequest(req: Request): number | { status: number; error: string } {
  const defaultCid = backendDemoCampaignId();
  const rawCampaign = queryParam(req, "ab_campaign_id");
  if (rawCampaign === undefined) return defaultCid;
  const parsed = parseNumericId(rawCampaign);
  if (parsed === null || !isCampaignId(parsed)) {
    return { status: 400, error: "ab_campaign_id invalide (nombre 10000–99999)" };
  }
  return parsed;
}

/**
 * Même logique que le remote `AbTestSlot` : simulation / forçage via query string.
 */
function evaluateOptionsFromRequest(req: Request):
  | {
      ok: true;
      campaignId: number;
      simulation: { variationId?: number } | null;
      skip: boolean;
    }
  | { ok: false; status: number; error: string } {
  const cidOrErr = campaignIdFromRequest(req);
  if (typeof cidOrErr !== "number") {
    return { ok: false, status: cidOrErr.status, error: cidOrErr.error };
  }
  const campaignId = cidOrErr;

  if (queryParam(req, "ab_skip") === "1") {
    return {
      ok: true,
      campaignId,
      simulation: null,
      skip: true,
    };
  }

  const simulationFlag =
    queryParam(req, "ab_simulation") === "1" || queryParam(req, "ab_force") === "1";
  const rawVariation = queryParam(req, "ab_variation_id");
  const hasVariationParam = rawVariation !== undefined;
  const forcedVariationId = hasVariationParam ? parseNumericId(rawVariation!) : undefined;

  if (hasVariationParam && forcedVariationId === null) {
    return { ok: false, status: 400, error: "ab_variation_id invalide (nombre entier)" };
  }

  const simulation =
    simulationFlag || hasVariationParam
      ? forcedVariationId !== null && forcedVariationId !== undefined
        ? { variationId: forcedVariationId }
        : {}
      : null;

  return { ok: true, campaignId, simulation, skip: false };
}

type EvaluateOkBody = {
  campaign: { type?: string };
  variation: {
    id: number;
    featureFlags?: Record<string, boolean>;
  };
  reason: string;
};

export function attachBackendAbtestLabRoute(app: Express): void {
  app.get("/api/lab/backend-abtest", async (req: Request, res: Response) => {
    const opts = evaluateOptionsFromRequest(req);
    if (!opts.ok) {
      res.status(opts.status).json({ error: opts.error });
      return;
    }

    const { campaignId, simulation, skip } = opts;

    if (skip) {
      res.json({
        ok: false,
        campaignId,
        variationId: null,
        reason: "ab_skip",
        featureFlags: {} as Record<string, boolean>,
        lab: {
          abSkipped: true,
          simulation: null,
          campaignId,
        },
      });
      return;
    }

    const cookies = parseCookieHeader(req.headers.cookie);
    let userId = cookies[VISITOR_COOKIE]?.trim();
    const setCookies: string[] = [];
    if (!userId) {
      userId = crypto.randomUUID();
      setCookies.push(cookieAttr(VISITOR_COOKIE, userId, ONE_YEAR_S));
    }

    const assignName = assignmentCookieName(campaignId);
    const stickyRaw = cookies[assignName]?.trim();
    let assignedVariationId: number | undefined;
    if (stickyRaw && /^\d+$/.test(stickyRaw)) {
      const n = Number(stickyRaw);
      if (Number.isSafeInteger(n)) assignedVariationId = n;
    }

    const context: Record<string, unknown> = {
      userId,
      route: req.path,
      url: `${req.protocol}://${req.get("host") ?? "localhost"}${req.originalUrl}`,
      cookies,
    };
    if (assignedVariationId !== undefined) {
      context.assignedVariationId = assignedVariationId;
    }

    const apiBase = abtestApiUrl();
    let body: EvaluateOkBody;
    try {
      const r = await fetch(`${apiBase.replace(/\/$/, "")}/api/evaluate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          campaignId,
          context,
          simulation,
        }),
      });
      if (!r.ok) {
        const errText = await r.text().catch(() => "");
        res.status(200).json({
          ok: false,
          campaignId,
          variationId: null,
          reason: "evaluate_http_error",
          featureFlags: {} as Record<string, boolean>,
          httpStatus: r.status,
          detail: errText.slice(0, 500),
          lab: { simulation, campaignId },
        });
        for (const c of setCookies) res.append("Set-Cookie", c);
        return;
      }
      body = (await r.json()) as EvaluateOkBody;
    } catch (e) {
      res.status(200).json({
        ok: false,
        campaignId,
        variationId: null,
        reason: "api_unavailable",
        featureFlags: {} as Record<string, boolean>,
        detail: (e as Error).message,
        lab: { simulation, campaignId },
      });
      for (const c of setCookies) res.append("Set-Cookie", c);
      return;
    }

    const variationId = body.variation.id;
    setCookies.push(cookieAttr(assignName, String(variationId), ONE_YEAR_S));

    for (const c of setCookies) res.append("Set-Cookie", c);

    res.json({
      ok: true,
      campaignId,
      variationId,
      reason: body.reason,
      featureFlags: body.variation.featureFlags ?? {},
      lab: {
        simulation,
        campaignId,
        abSkipped: false,
      },
    });
  });
}
