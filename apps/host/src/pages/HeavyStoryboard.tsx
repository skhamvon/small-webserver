import { useLayoutEffect, useRef } from "react";
import styles from "./HeavyStoryboard.module.css";

/**
 * Section « lourde » : GSAP + ScrollTrigger chargés dynamiquement (gros coût réseau + parse).
 */
function HeavyStoryboard() {
  const rootRef = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    let ctxCleanup: (() => void) | undefined;
    let cancelled = false;

    void Promise.all([import("gsap"), import("gsap/ScrollTrigger")]).then(
      ([{ gsap }, scrollMod]) => {
        if (cancelled || !rootRef.current) return;
        const { ScrollTrigger } = scrollMod;
        gsap.registerPlugin(ScrollTrigger);

        const ctx = gsap.context(() => {
          const steps = gsap.utils.toArray<HTMLElement>("[data-heavy-step]");
          steps.forEach((el, i) => {
            gsap.fromTo(
              el,
              { opacity: 0, y: 48, rotateX: -6 },
              {
                opacity: 1,
                y: 0,
                rotateX: 0,
                duration: 0.85,
                ease: "power3.out",
                scrollTrigger: {
                  trigger: el,
                  start: "top 82%",
                  end: "top 40%",
                  scrub: false,
                  toggleActions: "play none none reverse",
                },
                delay: i * 0.05,
              }
            );
          });

          gsap.to("[data-orbit]", {
            rotation: 360,
            duration: 42,
            repeat: -1,
            ease: "none",
            transformOrigin: "50% 50%",
          });
        }, rootRef);

        ctxCleanup = () => ctx.revert();
      }
    );

    return () => {
      cancelled = true;
      ctxCleanup?.();
    };
  }, []);

  return (
    <section ref={rootRef} className={styles.board} aria-labelledby="heavy-journey-title">
      <h2 id="heavy-journey-title" className={styles.title}>
        Parcours produit animé
      </h2>
      <p className={styles.sub}>
        Cette frise est animée avec GSAP et ScrollTrigger (bundles séparés, chargés à la demande).
      </p>

      <div className={styles.orbitWrap} aria-hidden>
        <div data-orbit className={styles.orbit}>
          <span className={styles.dot} />
        </div>
      </div>

      <ol className={styles.steps}>
        <li data-heavy-step className={styles.step}>
          <strong>Discovery</strong>
          <span>Cartographie des besoins et contraintes réseau.</span>
        </li>
        <li data-heavy-step className={styles.step}>
          <strong>Provisioning</strong>
          <span>Allocation automatique et validation des quotas.</span>
        </li>
        <li data-heavy-step className={styles.step}>
          <strong>Run</strong>
          <span>Supervision, mises à jour et retours arrière planifiés.</span>
        </li>
      </ol>
    </section>
  );
}

export { HeavyStoryboard };
export default HeavyStoryboard;
