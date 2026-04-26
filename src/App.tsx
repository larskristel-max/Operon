import { useEffect, useMemo, useState } from "react";
import { useApp } from "@/context/AppContext";
import { hasSelectedLanguage, useLanguage, type Language } from "@/contexts/LanguageContext";
import operonLogo from "../assets/Operonv1.png";
import tankImage from "../assets/Tankimageasset.png";
import { AuthGate } from "@/ui/auth/AuthGate";
import { ProtectedShell } from "@/ui/shell/ProtectedShell";

type LanguageOption = {
  code: Language;
  label: string;
  flag: string;
};

const SPLASH_MS = 1650;

const languageOptions: LanguageOption[] = [
  { code: "en", label: "English", flag: "🇺🇸" },
  { code: "fr", label: "Français", flag: "🇫🇷" },
  { code: "de", label: "Deutsch", flag: "🇩🇪" },
  { code: "nl", label: "Nederlands", flag: "🇳🇱" },
];
const selectLanguageTitle: Record<Language, string> = {
  en: "Select your language",
  es: "Selecciona tu idioma",
  fr: "Choisissez votre langue",
  de: "Sprache auswählen",
  pt: "Selecione seu idioma",
  ja: "言語を選択",
  nl: "Selecteer je taal",
};

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
        <h1>{selectLanguageTitle[language] ?? selectLanguageTitle.en}</h1>

        <ul className="language-list" role="listbox" aria-label="Language options">
          {languageOptions.map((option) => {
            return (
              <li key={option.code}>
                <button
                  type="button"
                  className="language-row"
                  onClick={() => {
                    setLanguage(option.code);
                    onContinue();
                  }}
                >
                  <span className="language-flag">{option.flag}</span>
                  <span className="language-label">{option.label}</span>
                  <span className="language-end">›</span>
                </button>
              </li>
            );
          })}
        </ul>
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
  const { authStatus, isDemoMode, enterDemoMode } = useApp();
  const [splashVisible, setSplashVisible] = useState(true);
  const [bootLanguagePending, setBootLanguagePending] = useState(() => !hasSelectedLanguage());
  const [languageSelectionOpen, setLanguageSelectionOpen] = useState(false);
  const [startDemoAfterLanguage, setStartDemoAfterLanguage] = useState(false);
  const [demoStartError, setDemoStartError] = useState<string | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => setSplashVisible(false), SPLASH_MS);
    return () => window.clearTimeout(timer);
  }, []);

  const finishLanguage = useMemo(
    () => async () => {
      if (startDemoAfterLanguage) {
        try {
          setDemoStartError(null);
          await enterDemoMode();
          setBootLanguagePending(false);
          setLanguageSelectionOpen(false);
        } catch (error) {
          setDemoStartError(error instanceof Error ? error.message : "Failed to start demo mode");
          setLanguageSelectionOpen(false);
        } finally {
          setStartDemoAfterLanguage(false);
        }
        return;
      }
      setBootLanguagePending(false);
      setLanguageSelectionOpen(false);
    },
    [enterDemoMode, startDemoAfterLanguage]
  );

  if (authStatus === "booting") return <BootScreen />;
  if (splashVisible) return <SplashScreen />;
  if (bootLanguagePending && !isDemoMode && !languageSelectionOpen) {
    return <LanguageSelectionScreen onContinue={finishLanguage} />;
  }
  if (languageSelectionOpen) {
    return <LanguageSelectionScreen onContinue={finishLanguage} />;
  }

  if (authStatus === "authenticated" || authStatus === "refreshing") {
    return <ProtectedShell onChangeLanguage={() => setLanguageSelectionOpen(true)} />;
  }
  if (isDemoMode) return <ProtectedShell onChangeLanguage={() => setLanguageSelectionOpen(true)} />;
  if (authStatus === "unauthenticated") {
    return (
      <AuthGate
        demoStartError={demoStartError}
        onRequireLanguageSelection={() => {
          setDemoStartError(null);
          setStartDemoAfterLanguage(true);
          setLanguageSelectionOpen(true);
        }}
      />
    );
  }
  return (
    <AuthGate
      demoStartError={demoStartError}
      onRequireLanguageSelection={() => {
        setDemoStartError(null);
        setStartDemoAfterLanguage(true);
        setLanguageSelectionOpen(true);
      }}
    />
  );
}
