import { Link, Outlet } from "react-router-dom";
import { AbTestRemoteSlot } from "@/components/AbTestRemoteSlot";
import styles from "./SiteLayout.module.css";

const ovhPath = "/ovh-bare-metal/";

export function SiteLayout() {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <Link to="/" className={styles.brand}>
          Labo <span>AB</span>
        </Link>
        <nav className={styles.nav} aria-label="Principal">
          <Link to="/demo/fast">Démo rapide</Link>
          <Link to="/demo/heavy">Démo lourde</Link>
          <a href={ovhPath}>Page OVH (clone)</a>
        </nav>
      </header>

      <AbTestRemoteSlot />

      <main className={styles.main}>
        <Outlet />
      </main>

      <footer className={styles.footer}>
        <p>
          Environnement de test — thème et navigation partagés pour expérimentations
          A/B et feature flags.
        </p>
      </footer>
    </div>
  );
}
