import styles from "./HeavyTestimonials.module.css";

const items = [
  {
    quote:
      "Nous avons réduit le temps de mise en ligne de nos environnements de test d’environ deux jours.",
    author: "Équipe plateforme — secteur finance",
  },
  {
    quote:
      "La visibilité sur les étapes de provisioning nous a permis d’aligner sécurité et R&D sur un même calendrier.",
    author: "Responsable infra — e-commerce",
  },
];

/** Chunk séparé pour augmenter le coût de chargement / parse sans gonfler artificiellement le HTML. */
export default function HeavyTestimonials() {
  return (
    <section className={styles.section} aria-labelledby="heavy-t-title">
      <h2 id="heavy-t-title" className={styles.h2}>
        Retours clients
      </h2>
      <ul className={styles.list}>
        {items.map((item) => (
          <li key={item.author} className={styles.item}>
            <blockquote className={styles.quote}>{item.quote}</blockquote>
            <cite className={styles.cite}>{item.author}</cite>
          </li>
        ))}
      </ul>
    </section>
  );
}
