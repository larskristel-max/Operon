import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "@/App";
import { AppProvider } from "@/context/AppContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import "@/styles.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <LanguageProvider>
      <AppProvider>
        <App />
      </AppProvider>
    </LanguageProvider>
  </StrictMode>
);
