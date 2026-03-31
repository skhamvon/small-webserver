import { Suspense, lazy } from "react";
import { useBooleanFlag } from "@/hooks/useBooleanFlag";
import styles from "./AbTestRemoteSlot.module.css";

const RemoteAbTestSlot = lazy(() => import("abtest_remote/AbTestSlot"));

export function AbTestRemoteSlot() {
  const enabled = useBooleanFlag("enable_remote_abtest_shell", true);
  if (!enabled) return null;

  return (
    <div className={styles.wrap}>
      <Suspense
        fallback={
          <div className={styles.fallback} data-abtest-loading>
            Chargement du module distant…
          </div>
        }
      >
        <RemoteAbTestSlot />
      </Suspense>
    </div>
  );
}
