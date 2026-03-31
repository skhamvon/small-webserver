import { Suspense, lazy } from "react";
import { useBooleanFlag } from "@/hooks/useBooleanFlag";
import demoStyles from "./DemoPages.module.css";

const HeavyStoryboard = lazy(() => import("./HeavyStoryboard"));
const HeavyVendorDemo = lazy(() => import("./HeavyVendorDemo"));
const HeavyGallery = lazy(() => import("./HeavyGallery"));
const HeavyTestimonials = lazy(() => import("./HeavyTestimonials"));

function BlockFallback({ label }: { label: string }) {
  return (
    <div
      style={{
        padding: "2rem 1rem",
        margin: "1.5rem 0",
        borderRadius: "var(--radius)",
        border: "1px dashed var(--color-border)",
        color: "var(--color-text-muted)",
        textAlign: "center",
      }}
    >
      Chargement : {label}…
    </div>
  );
}

export function HeavyPage() {
  const heroVariant = useBooleanFlag("show_heavy_hero_variant", false);

  return (
    <article className={heroVariant ? demoStyles.variantAlt : undefined}>
      <section className={demoStyles.overview}>
        <p className={demoStyles.kicker}>Parcours riche</p>
        <h1 className={demoStyles.h1}>Offre « Performance lab »</h1>
        <p className={demoStyles.intro}>
          Page de stress : plusieurs chunks lazy (Three.js, lodash-es, GSAP,
          galerie HD, témoignages), pour un coût réseau et CPU nettement plus élevé
          que la démo rapide. Combinez avec <code>THROTTLE_KBPS</code> sur le
          serveur pour simuler une liaison lente.
        </p>
      </section>

      <div className={demoStyles.banner} role="presentation">
        <span>
          Feature flag <code>show_heavy_hero_variant</code> :{" "}
          {heroVariant ? "variante B (accent sur l’overview)" : "variante A (standard)"}
        </span>
      </div>

      <section className={demoStyles.grid}>
        <div className={demoStyles.card}>
          <div
            className={demoStyles.thumb}
            style={{
              background:
                "linear-gradient(160deg, #4c1d95 0%, #1a2332 50%, #a78bfa44 100%)",
            }}
            aria-hidden
          />
          <h2 className={demoStyles.cardTitle}>Orchestration</h2>
          <p className={demoStyles.cardText}>
            Enchaînements d’API et files de jobs pour déployer des stacks de test
            reproductibles.
          </p>
          <button type="button" className={demoStyles.btn}>
            Lancer une recette
          </button>
        </div>
        <div className={demoStyles.card}>
          <div
            className={demoStyles.thumb}
            style={{
              background:
                "linear-gradient(160deg, #0f766e 0%, #1a2332 55%, #5eead444 100%)",
            }}
            aria-hidden
          />
          <h2 className={demoStyles.cardTitle}>Observabilité</h2>
          <p className={demoStyles.cardText}>
            Corrélation des métriques front et des traces côté API pour isoler les
            régressions.
          </p>
          <button type="button" className={demoStyles.btnSecondary}>
            Voir les dashboards
          </button>
        </div>
      </section>

      <Suspense fallback={<BlockFallback label="Three.js / lodash" />}>
        <HeavyVendorDemo />
      </Suspense>

      <Suspense fallback={<BlockFallback label="GSAP / ScrollTrigger" />}>
        <HeavyStoryboard />
      </Suspense>

      <Suspense fallback={<BlockFallback label="Galerie HD" />}>
        <HeavyGallery />
      </Suspense>

      <Suspense fallback={<BlockFallback label="Témoignages" />}>
        <HeavyTestimonials />
      </Suspense>

      <section className={demoStyles.prose}>
        <h2>Charge réseau</h2>
        <p>
          Combinez cette page avec une limitation de débit côté serveur (
          <code>THROTTLE_KBPS</code>) pour reproduire des conditions mobiles ou des
          liaisons saturées.
        </p>
      </section>
    </article>
  );
}
