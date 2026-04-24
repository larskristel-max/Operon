import type { Language } from "@/contexts/LanguageContext";

type DashboardCopy = {
  greetingHello: string;
  greetingBrewer: string;
  heroSubtitleDefault: string;
  heroSubtitleDemo: string;
  currentlyBrewing: string;
  waitingForData: string;
  days: string;
  fermentationProgress: string;
  atAGlance: string;
  viewAll: string;
  quickActions: string;
  quickActionStartBrew: string;
  quickActionLogFermentation: string;
  changeLanguage: string;
  quickActionAddInventory: string;
  quickActionViewReports: string;
  navHome: string;
  navBrewery: string;
  navTasks: string;
  navMore: string;
  exitDemoMode: string;
  signOut: string;
  retryProfileLoad: string;
  tanks: string;
  active: string;
  waterUsage: string;
  today: string;
  orders: string;
  toFulfill: string;
  inventory: string;
  lowStock: string;
  batchIdPrefix: string;
  inFermentation: string;
};

const dashboardCopy: Record<"en" | "fr" | "de" | "nl", DashboardCopy> = {
  en: {
    greetingHello: "Hello",
    greetingBrewer: "brewer",
    heroSubtitleDefault: "Connect live brewery data to populate this dashboard.",
    heroSubtitleDemo: "Here’s what’s brewing today.",
    currentlyBrewing: "CURRENTLY BREWING",
    waitingForData: "Waiting for data",
    days: "DAYS",
    fermentationProgress: "FERMENTATION PROGRESS",
    atAGlance: "At a Glance",
    viewAll: "View All",
    quickActions: "Quick Actions",
    quickActionStartBrew: "Start Brew",
    quickActionLogFermentation: "Fermentation",
    quickActionAddInventory: "Add Inventory",
    quickActionViewReports: "View Reports",
    navHome: "Home",
    navBrewery: "Brewery",
    navTasks: "Tasks",
    navMore: "More",
    exitDemoMode: "Exit Demo Mode",
    signOut: "Sign Out",
    changeLanguage: "Change language",
    retryProfileLoad: "Retry profile load",
    tanks: "TANKS",
    active: "Active",
    waterUsage: "WATER USAGE",
    today: "Today",
    orders: "ORDERS",
    toFulfill: "To Fulfill",
    inventory: "INVENTORY",
    lowStock: "Low Stock",
    batchIdPrefix: "Batch #",
    inFermentation: "In Fermentation",
  },
  fr: {
    greetingHello: "Bonjour",
    greetingBrewer: "brasseur",
    heroSubtitleDefault: "Connectez les données de la brasserie pour alimenter ce tableau de bord.",
    heroSubtitleDemo: "Voici ce qui est en brassage aujourd’hui.",
    currentlyBrewing: "EN BRASSAGE",
    waitingForData: "En attente de données",
    days: "JOURS",
    fermentationProgress: "PROGRESSION DE FERMENTATION",
    atAGlance: "Aperçu",
    viewAll: "Voir tout",
    quickActions: "Actions rapides",
    quickActionStartBrew: "Démarrer brassage",
    quickActionLogFermentation: "Fermentation",
    quickActionAddInventory: "Ajouter stock",
    quickActionViewReports: "Voir rapports",
    navHome: "Accueil",
    navBrewery: "Brasserie",
    navTasks: "Tâches",
    navMore: "Plus",
    exitDemoMode: "Quitter le mode démo",
    signOut: "Se déconnecter",
    changeLanguage: "Changer la langue",
    retryProfileLoad: "Réessayer le profil",
    tanks: "CUVES",
    active: "Actives",
    waterUsage: "EAU UTILISÉE",
    today: "Aujourd’hui",
    orders: "COMMANDES",
    toFulfill: "À traiter",
    inventory: "INVENTAIRE",
    lowStock: "Stock bas",
    batchIdPrefix: "Lot #",
    inFermentation: "En fermentation",
  },
  de: {
    greetingHello: "Hallo",
    greetingBrewer: "Brauer",
    heroSubtitleDefault: "Verbinde Live-Brauereidaten, um dieses Dashboard zu füllen.",
    heroSubtitleDemo: "Das ist heute in Produktion.",
    currentlyBrewing: "AKTUELL IM SUD",
    waitingForData: "Warten auf Daten",
    days: "TAGE",
    fermentationProgress: "GÄRVERLAUF",
    atAGlance: "Auf einen Blick",
    viewAll: "Alle anzeigen",
    quickActions: "Schnellaktionen",
    quickActionStartBrew: "Sud starten",
    quickActionLogFermentation: "Gärung",
    quickActionAddInventory: "Bestand hinzufügen",
    quickActionViewReports: "Berichte ansehen",
    navHome: "Start",
    navBrewery: "Brauerei",
    navTasks: "Aufgaben",
    navMore: "Mehr",
    exitDemoMode: "Demo-Modus beenden",
    signOut: "Abmelden",
    changeLanguage: "Sprache ändern",
    retryProfileLoad: "Profil neu laden",
    tanks: "TANKS",
    active: "Aktiv",
    waterUsage: "WASSERVERBRAUCH",
    today: "Heute",
    orders: "BESTELLUNGEN",
    toFulfill: "Offen",
    inventory: "INVENTAR",
    lowStock: "Niedriger Bestand",
    batchIdPrefix: "Charge #",
    inFermentation: "In Gärung",
  },
  nl: {
    greetingHello: "Hallo",
    greetingBrewer: "brouwer",
    heroSubtitleDefault: "Koppel live brouwerijdata om dit dashboard te vullen.",
    heroSubtitleDemo: "Dit staat er vandaag op de planning.",
    currentlyBrewing: "NU AAN HET BROUWEN",
    waitingForData: "Wachten op data",
    days: "DAGEN",
    fermentationProgress: "VERGISTINGSGANG",
    atAGlance: "In één oogopslag",
    viewAll: "Alles bekijken",
    quickActions: "Snelle acties",
    quickActionStartBrew: "Brouw starten",
    quickActionLogFermentation: "Vergisting",
    quickActionAddInventory: "Voorraad toevoegen",
    quickActionViewReports: "Rapporten bekijken",
    navHome: "Home",
    navBrewery: "Brouwerij",
    navTasks: "Taken",
    navMore: "Meer",
    exitDemoMode: "Demomodus afsluiten",
    signOut: "Uitloggen",
    changeLanguage: "Taal wijzigen",
    retryProfileLoad: "Profiel opnieuw laden",
    tanks: "TANKS",
    active: "Actief",
    waterUsage: "WATERVERBRUIK",
    today: "Vandaag",
    orders: "BESTELLINGEN",
    toFulfill: "Te leveren",
    inventory: "VOORRAAD",
    lowStock: "Lage voorraad",
    batchIdPrefix: "Batch #",
    inFermentation: "In vergisting",
  },
};

export function getDashboardCopy(language: Language): DashboardCopy {
  if (language === "fr" || language === "de" || language === "nl") {
    return dashboardCopy[language];
  }
  return dashboardCopy.en;
}
