import { useEffect, useMemo, useState } from "react";
import { useApp } from "@/context/AppContext";
import { useLanguage, type Language } from "@/contexts/LanguageContext";
import operonLogo from "../assets/Operonv1.png";
import tankImage from "../assets/Tankimageasset.png";
import { AuthGate } from "@/ui/auth/AuthGate";
import { ProtectedShell } from "@/ui/shell/ProtectedShell";

type LanguageOption = {
  code: Language;
  label: string;
  flag: string;
};

const ONBOARDING_KEY = "operon_onboarding_completed";
const SPLASH_MS = 1650;

const languageOptions: LanguageOption[] = [
  { code: "en", label: "English", flag: "🇺🇸" },
  { code: "es", label: "Español", flag: "🇪🇸" },
  { code: "fr", label: "Français", flag: "🇫🇷" },
  { code: "de", label: "Deutsch", flag: "🇩🇪" },
  { code: "pt", label: "Português", flag: "🇧🇷" },
  { code: "ja", label: "日本語", flag: "🇯🇵" },
];

function SplashScreen() {
  return (
    <main className="operon-screen operon-splash">
      <div className="splash-tank-wrap">
        <img src={tankImage} alt="Brewery tank" className="splash-tank" />
      </div>
      <div className="splash-brand">
        <img src={operonLogo} alt="Operon brand mark" className="operon-mark" />
        <h1>OPERON</h1>
        <p>BREW BETTER. OPERATE SMARTER.</p>
      </div>
      <div className="splash-progress" aria-hidden="true">
        <span />
      </div>
    </main>
  );
}

function LanguageSelectionScreen({ onContinue }: { onContinue: () => void }) {
  const { language, setLanguage } = useLanguage();

  return (
    <main className="operon-screen operon-language">
      <section className="glass-panel language-panel">
        <img src={operonLogo} alt="Operon brand mark" className="operon-mark" />
        <h1>Welcome to Operon</h1>
        <p className="screen-subtitle">Choose your preferred language.</p>

        <ul className="language-list" role="listbox" aria-label="Language options">
          {languageOptions.map((option) => {
            const selected = language === option.code;
            return (
              <li key={option.code}>
                <button
                  type="button"
                  className={`language-row${selected ? " selected" : ""}`}
                  onClick={() => setLanguage(option.code)}
                  aria-selected={selected}
                >
                  <span className="language-flag">{option.flag}</span>
                  <span className="language-label">{option.label}</span>
                  <span className="language-end">{selected ? "✓" : "›"}</span>
                </button>
              </li>
            );
          })}
        </ul>

        <button type="button" className="gold-btn" onClick={onContinue}>
          Continue
        </button>
      </section>
    </main>
  );
}

function BootScreen() {
  return (
    <main className="operon-screen operon-boot">
      <p className="eyebrow">Operon</p>
      <h1>Restoring secure session…</h1>
    </main>
  );
}

export default function App() {
  const { authStatus, isDemoMode } = useApp();
  const [splashVisible, setSplashVisible] = useState(true);
  const [languageComplete, setLanguageComplete] = useState(
    () => localStorage.getItem(ONBOARDING_KEY) === "1"
  );

  useEffect(() => {
    const timer = window.setTimeout(() => setSplashVisible(false), SPLASH_MS);
    return () => window.clearTimeout(timer);
  }, []);

  const finishLanguage = useMemo(
    () => () => {
      localStorage.setItem(ONBOARDING_KEY, "1");
      setLanguageComplete(true);
    },
    []
  );

  if (authStatus === "booting") return <BootScreen />;
  if (splashVisible) return <SplashScreen />;

  if (authStatus === "authenticated" || authStatus === "refreshing") {
    return <ProtectedShell />;
  }
  if (authStatus === "unauthenticated") {
    if (!languageComplete) return <LanguageSelectionScreen onContinue={finishLanguage} />;
    if (isDemoMode) return <ProtectedShell />;
    return <AuthGate />;
  }
  return <AuthGate />;
}
