import styles from "./DemoPages.module.css";

export function FastPage() {
  return (
    <article>
      <section className={styles.overview}>
        <p className={styles.kicker}>Parcours léger</p>
        <h1 className={styles.h1}>Offre « Starter »</h1>
        <p className={styles.intro}>
          Cette page est volontairement simple : HTML/CSS majoritaires, une petite
          image, pas d’animations lourdes. Idéale comme baseline pour comparer les
          temps de chargement et les métriques Web Vitals.
        </p>
      </section>

      <div className={styles.banner} role="presentation">
        <span>Livraison prioritaire sous 48 h sur la zone EU</span>
      </div>

      <section className={styles.grid}>
        <div className={styles.card}>
          <div
            className={styles.thumb}
            style={{
              background:
                "linear-gradient(145deg, #2a3f5f 0%, #1a2332 60%, #3d8bfd33 100%)",
            }}
            aria-hidden
          />
          <h2 className={styles.cardTitle}>Capacité</h2>
          <p className={styles.cardText}>
            Jusqu’à 8 vCPU et 32 Go RAM pour vos charges de développement et de
            préproduction.
          </p>
          <button type="button" className={styles.btn}>
            Configurer
          </button>
        </div>
        <div className={styles.card}>
          <div
            className={styles.thumb}
            style={{
              background:
                "linear-gradient(145deg, #1e3d2e 0%, #1a2332 55%, #4ade8033 100%)",
            }}
            aria-hidden
          />
          <h2 className={styles.cardTitle}>Stockage</h2>
          <p className={styles.cardText}>
            NVMe local pour des I/O prévisibles ; snapshots planifiables pour le
            retour arrière.
          </p>
          <button type="button" className={styles.btnSecondary}>
            Voir les options
          </button>
        </div>
      </section>

      <section className={styles.prose}>
        <h2>Pourquoi cette page existe</h2>
        <p>
          Les campagnes A/B mesurent souvent l’impact sur des pages « rapides »
          avant d’élargir à des expériences plus riches. Ce gabarit vous donne un
          contenu crédible (titres, CTA, grille) sans dépendre d’assets tiers
          lourds.
        </p>
      </section>
    </article>
  );
}
