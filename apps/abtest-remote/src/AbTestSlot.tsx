import styles from "./AbTestSlot.module.css";

/**
 * Point d’accroche Module Federation : remplacé plus tard par la logique A/B interne.
 */
function AbTestSlot() {
  return (
    <aside className={styles.slot} data-abtest-remote="true">
      <span className={styles.badge}>Remote MF</span>
      <p className={styles.text}>
        Slot chargé depuis le build <code>abtest-remote</code>. Branchez ici votre
        bundle d’expérimentation sans toucher au contenu principal du host.
      </p>
    </aside>
  );
}

export default AbTestSlot;
