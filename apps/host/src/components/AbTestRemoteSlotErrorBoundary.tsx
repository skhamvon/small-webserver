import { Component, type ErrorInfo, type ReactNode } from "react";
import styles from "./AbTestRemoteSlot.module.css";

type Props = { children: ReactNode };

type State = {
  hasError: boolean;
  message?: string;
};

/**
 * Évite de faire planter tout le host si le remote MF est injoignable
 * (mauvais port, remote non démarré, MIME / CORS).
 */
export class AbTestRemoteSlotErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(err: Error): State {
    return { hasError: true, message: err.message };
  }

  componentDidCatch(err: Error, info: ErrorInfo): void {
    globalThis.console.warn("[AbTestRemoteSlot] chargement remote échoué", err, info.componentStack);
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className={styles.wrap}>
          <div className={styles.fallback} role="alert" data-abtest-remote-error>
            <strong>Remote Module Federation indisponible.</strong> Les pages du lab
            restent utilisables. Démarrez le workspace <code>abtest-remote</code> (
            <code>npm run dev</code> à la racine du monorepo) et vérifiez{" "}
            <code>VITE_ABTEST_REMOTE_URL</code> / <code>VITE_ABTEST_REMOTE_PORT</code>{" "}
            (défaut : <code>http://localhost:5101/remote/remoteEntry.js</code>).
            {this.state.message ? (
              <span style={{ display: "block", marginTop: "0.5rem", fontSize: "0.85rem" }}>
                {this.state.message}
              </span>
            ) : null}
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
