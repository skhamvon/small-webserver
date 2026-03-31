import styles from "./HeavyGallery.module.css";

/** Images HD distantes (picsum seed) pour allonger le chargement réseau. */
const SHOTS = [
  { seed: "labo-heavy-a", alt: "Datacenter — visuel 1" },
  { seed: "labo-heavy-b", alt: "Infrastructure — visuel 2" },
  { seed: "labo-heavy-c", alt: "Réseau — visuel 3" },
  { seed: "labo-heavy-d", alt: "Stockage — visuel 4" },
  { seed: "labo-heavy-e", alt: "Sécurité — visuel 5" },
  { seed: "labo-heavy-f", alt: "Monitoring — visuel 6" },
];

const W = 2400;
const H = 1600;

export default function HeavyGallery() {
  return (
    <section className={styles.section} aria-labelledby="heavy-gallery-title">
      <h2 id="heavy-gallery-title" className={styles.h2}>
        Galerie (images HD)
      </h2>
      <p className={styles.lead}>
        Six visuels {W}×{H} chargés en lazy pour simuler une page média lourde.
      </p>
      <ul className={styles.grid}>
        {SHOTS.map((s) => (
          <li key={s.seed} className={styles.item}>
            <img
              className={styles.img}
              src={`https://picsum.photos/seed/${s.seed}/${W}/${H}`}
              width={W}
              height={H}
              alt={s.alt}
              loading="lazy"
              decoding="async"
            />
          </li>
        ))}
      </ul>
    </section>
  );
}
