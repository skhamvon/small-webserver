import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "@hackathon/ui/theme.css";
import { OpenFeature } from "@openfeature/web-sdk";
import { createJsonFileProvider } from "./openfeature/jsonFileProvider";
import { App } from "./App";

const flagsUrl = "/feature-flags.json";

async function bootstrap() {
  const provider = createJsonFileProvider(flagsUrl);
  await OpenFeature.setProviderAndWait(provider);

  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </StrictMode>
  );
}

void bootstrap();
