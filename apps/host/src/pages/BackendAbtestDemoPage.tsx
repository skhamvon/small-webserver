import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import styles from "./DemoPages.module.css";

type LabPayload = {
  ok: boolean;
  campaignId: number;
  variationId: number | null;
  reason: string;
  featureFlags: Record<string, boolean>;
  detail?: string;
  httpStatus?: number;
  lab?: {
    simulation: { variationId?: number } | null;
    campaignId: number;
    abSkipped?: boolean;
  };
};

const BG_NEUTRAL = "#ebeef2";
const BG_WARM = "#fff4e8";
/** Texte sombre lisible sur les fonds clairs du lab (sans casser le thème global du `body`). */
const LAB_FG = "#0f1419";

const DEMO_CAMPAIGN_FALLBACK = 10003;

export function BackendAbtestDemoPage() {
  const location = useLocation();
  const [payload, setPayload] = useState<LabPayload | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const qs = location.search;
    const apiUrl = qs ? `/api/lab/backend-abtest${qs}` : "/api/lab/backend-abtest";
    (async () => {
      try {
        setLoadError(null);
        const res = await fetch(apiUrl, {
          credentials: "same-origin",
        });
        const raw = (await res.json()) as LabPayload & { error?: string };
        if (cancelled) return;
        if (!res.ok) {
          setPayload(null);
          setLoadError(raw.error ?? `Erreur ${res.status}`);
          return;
        }
        setPayload(raw);
        globalThis.console.info("[lab backend A/B]", raw);
      } catch (e) {
        if (!cancelled) {
          setLoadError((e as Error).message);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [location.search]);

  const cid = payload?.campaignId ?? payload?.lab?.campaignId ?? DEMO_CAMPAIGN_FALLBACK;
  const basePath = `${location.pathname}`;
  const simBase = `${basePath}?ab_campaign_id=${cid}`;

  const warmBg =
    payload?.ok === true &&
    payload.featureFlags?.lab_backend_warm_background === true;
  const labSurface =
    payload != null
      ? {
          background: warmBg ? BG_WARM : BG_NEUTRAL,
          color: LAB_FG,
        }
      : undefined;

  return (
    <article
      style={{
        ...labSurface,
        margin: "-2rem -1.5rem -3rem",
        padding: "2rem 1.5rem 3rem",
        minHeight: "42vh",
        borderRadius: "var(--radius)",
      }}
    >
      <section className={styles.overview}>
        <p className={styles.kicker}>Lab serveur</p>
        <h1 className={styles.h1}>A/B « backend » (feature flags)</h1>
        <p className={styles.intro}>
          Le serveur Node appelle l’API <code>abtest-solution</code> (
          <code>POST /api/evaluate</code>) et renvoie les drapeaux de la variante.
          Cette page n’applique que le résultat (fond de page + trace console) —
          la décision reste côté serveur.
        </p>
        <div
          className={styles.banner}
          style={{
            marginTop: "1rem",
            fontSize: "0.9rem",
            color: LAB_FG,
            borderColor: "rgba(15, 20, 25, 0.18)",
            background: "rgba(255, 255, 255, 0.55)",
          }}
        >
          <strong>Simulation (même paramètres que le remote front)</strong> — la query est
          relayée au serveur lab puis à <code>/api/evaluate</code>.
          <ul style={{ margin: "0.6rem 0 0", paddingLeft: "1.25rem" }}>
            <li>
              Mode simulation :{" "}
              <a href={`${simBase}&ab_simulation=1`} style={{ color: "#0b57d0" }}>
                <code>{simBase}&amp;ab_simulation=1</code>
              </a>
            </li>
            <li>
              Forcer la contrôle (id {String(cid)}0) :{" "}
              <a
                href={`${simBase}&ab_simulation=1&ab_variation_id=${String(cid)}0`}
                style={{ color: "#0b57d0" }}
              >
                <code>
                  {simBase}&amp;ab_simulation=1&amp;ab_variation_id={String(cid)}0
                </code>
              </a>
            </li>
            <li>
              Forcer la variante test (id {String(cid)}1) :{" "}
              <a
                href={`${simBase}&ab_simulation=1&ab_variation_id=${String(cid)}1`}
                style={{ color: "#0b57d0" }}
              >
                <code>
                  {simBase}&amp;ab_simulation=1&amp;ab_variation_id={String(cid)}1
                </code>
              </a>
            </li>
            <li>
              Sauter l’évaluation :{" "}
              <a href={`${simBase}&ab_skip=1`} style={{ color: "#0b57d0" }}>
                <code>{simBase}&amp;ab_skip=1</code>
              </a>
            </li>
          </ul>
          <p style={{ margin: "0.75rem 0 0", fontSize: "0.85rem", color: "rgba(15, 20, 25, 0.65)" }}>
            Optionnel : <code>ab_force=1</code> comme alias de <code>ab_simulation=1</code>.{" "}
            <code>ab_campaign_id</code> peut remplacer l’id défini par{" "}
            <code>ABTEST_BACKEND_DEMO_CAMPAIGN_ID</code> sur le serveur.
          </p>
        </div>
      </section>

      {loadError ? (
        <p className={styles.intro}>Erreur réseau : {loadError}</p>
      ) : payload ? (
        <section className={styles.grid}>
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Réponse lab</h2>
            <pre className={styles.intro} style={{ fontSize: "0.85rem", whiteSpace: "pre-wrap" }}>
              {JSON.stringify(payload, null, 2)}
            </pre>
          </div>
        </section>
      ) : (
        <p className={styles.intro}>Chargement…</p>
      )}
    </article>
  );
}
