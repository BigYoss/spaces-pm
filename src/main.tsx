import { StrictMode } from "react";
import { hydrateRoot, createRoot } from "react-dom/client";
import App from "./App";
import "./site.css";
import { initNav } from "./nav";

const root = document.getElementById("root")!;
const app = (
  <StrictMode>
    <App />
  </StrictMode>
);
// Production ships prerendered HTML (hydrate); dev starts empty (render).
if (root.hasChildNodes()) hydrateRoot(root, app);
else createRoot(root).render(app);
// The header markup is static, so the menu is wired once React has attached.
requestAnimationFrame(() => initNav());
