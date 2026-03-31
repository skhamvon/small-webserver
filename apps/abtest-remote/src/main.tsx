import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@hackathon/ui/theme.css";
import AbTestSlot from "./AbTestSlot";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <div style={{ padding: "1rem" }}>
      <p style={{ marginBottom: "0.75rem", color: "var(--color-text-muted)" }}>
        Build remote — prévisualisation locale du module exposé.
      </p>
      <AbTestSlot />
    </div>
  </StrictMode>
);
