import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

export type Language = "en" | "es" | "fr" | "de" | "pt" | "ja" | "nl";

interface LanguageContextValue {
  language: Language;
  setLanguage: (next: Language) => void;
}

export const LANGUAGE_KEY = "operon_language";

export function hasSelectedLanguage(): boolean {
  return Boolean(localStorage.getItem(LANGUAGE_KEY));
}
const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>(
    () => (localStorage.getItem(LANGUAGE_KEY) as Language | null) ?? "en"
  );

  const value = useMemo(
    () => ({
      language,
      setLanguage: (next: Language) => {
        localStorage.setItem(LANGUAGE_KEY, next);
        setLanguage(next);
      },
    }),
    [language]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within <LanguageProvider>");
  return ctx;
}
