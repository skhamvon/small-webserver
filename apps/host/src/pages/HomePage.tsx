import { Link } from "react-router-dom";
import styles from "./HomePage.module.css";

export function HomePage() {
  return (
    <article className={styles.article}>
      <section className={styles.hero}>
        <h1 className={styles.title}>Bienvenue dans le labo de test</h1>
        <p className={styles.lead}>
          Deux parcours démo partagent le même gabarit (menu, pied de page) pour
          préparer le remplacement d’une solution A/B externe par un socle interne.
        </p>
      </section>
      <ul className={styles.grid}>
        <li className={styles.card}>
          <h2>Démo rapide</h2>
          <p>Peu de JavaScript, chargement volontairement léger.</p>
          <Link className={styles.cta} to="/demo/fast">
            Ouvrir
          </Link>
        </li>
        <li className={styles.card}>
          <h2>Démo lourde</h2>
          <p>GSAP, sections lazy, volume de script plus important.</p>
          <Link className={styles.cta} to="/demo/heavy">
            Ouvrir
          </Link>
        </li>
        <li className={styles.card}>
          <h2>A/B backend (lab)</h2>
          <p>
            Le serveur Node interroge l’API d’évaluation et renvoie des feature
            flags ; fond de page selon la variante.
          </p>
          <Link className={styles.cta} to="/demo/backend-abtest">
            Ouvrir
          </Link>
        </li>
        <li className={styles.card}>
          <h2>Clone OVH bare-metal</h2>
          <p>Snapshot statique servi sous /ovh-bare-metal/ (via le serveur Node).</p>
          <a className={styles.cta} href="/ovh-bare-metal/">
            Ouvrir
          </a>
        </li>
      </ul>
    </article>
  );
}
