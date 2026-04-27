import type { Language } from "@/contexts/LanguageContext";

export type DashboardCopy = {
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
  brewEntryChooseRecipeSource: string;
  brewEntryExistingRecipe: string;
  brewEntryNewRecipe: string;
  brewEntryChooseExistingRecipePath: string;
  brewEntrySelectExistingRecipe: string;
  brewEntryUploadRecipe: string;
  brewEntryPlaceholderTitle: string;
  brewEntryPlaceholderDescription: string;
  brewEntryBack: string;
  brewEntryClose: string;
  brewEntryUploadHelp: string;
  brewEntryManualPaste: string;
  brewEntrySelectFile: string;
  brewEntryPrepareDraft: string;
  brewEntryReadyBoundary: string;
  brewEntryDraftReadyDescription: string;
  brewEntryNoWritesYet: string;
  brewEntryDemoDraftMode: string;
  brewEntrySelectedRecipePrefix: string;
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
    quickActionStartBrew: "Brew",
    quickActionLogFermentation: "Fermentation",
    quickActionAddInventory: "Add Inventory",
    quickActionViewReports: "View Reports",
    brewEntryChooseRecipeSource: "Choose recipe source",
    brewEntryExistingRecipe: "Existing recipe",
    brewEntryNewRecipe: "New recipe",
    brewEntryChooseExistingRecipePath: "Choose existing recipe path",
    brewEntrySelectExistingRecipe: "Select existing recipe",
    brewEntryUploadRecipe: "Upload recipe",
    brewEntryPlaceholderTitle: "Coming soon",
    brewEntryPlaceholderDescription: "This entry point is ready for a later phase.",
    brewEntryBack: "Back",
    brewEntryClose: "Close",
    brewEntryUploadHelp: "Accepted: PDF, image, spreadsheet, text, BeerXML, Brewfather export",
    brewEntryManualPaste: "Manual recipe paste",
    brewEntrySelectFile: "Select file",
    brewEntryPrepareDraft: "Prepare draft",
    brewEntryReadyBoundary: "Ready to confirm",
    brewEntryDraftReadyDescription: "Draft payload prepared. Confirmation is required before any batch write.",
    brewEntryNoWritesYet: "No database write has been executed.",
    brewEntryDemoDraftMode: "Demo mode: draft is simulated and isolated from production data.",
    brewEntrySelectedRecipePrefix: "Selected recipe",
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
    quickActionStartBrew: "Brassage",
    quickActionLogFermentation: "Fermentation",
    quickActionAddInventory: "Ajouter stock",
    quickActionViewReports: "Voir rapports",
    brewEntryChooseRecipeSource: "Choisir la source de recette",
    brewEntryExistingRecipe: "Recette existante",
    brewEntryNewRecipe: "Nouvelle recette",
    brewEntryChooseExistingRecipePath: "Choisir le type de recette existante",
    brewEntrySelectExistingRecipe: "Sélectionner une recette existante",
    brewEntryUploadRecipe: "Importer une recette",
    brewEntryPlaceholderTitle: "Bientôt disponible",
    brewEntryPlaceholderDescription: "Ce point d’entrée est prêt pour une phase suivante.",
    brewEntryBack: "Retour",
    brewEntryClose: "Fermer",
    brewEntryUploadHelp: "Accepté : PDF, image, tableur, texte, BeerXML, export Brewfather",
    brewEntryManualPaste: "Coller la recette manuellement",
    brewEntrySelectFile: "Sélectionner un fichier",
    brewEntryPrepareDraft: "Préparer le brouillon",
    brewEntryReadyBoundary: "Prêt à confirmer",
    brewEntryDraftReadyDescription: "Le brouillon est préparé. Une confirmation est requise avant toute écriture de lot.",
    brewEntryNoWritesYet: "Aucune écriture base de données n’a été effectuée.",
    brewEntryDemoDraftMode: "Mode démo : le brouillon est simulé et isolé des données de production.",
    brewEntrySelectedRecipePrefix: "Recette sélectionnée",
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
    quickActionStartBrew: "Brauen",
    quickActionLogFermentation: "Gärung",
    quickActionAddInventory: "Bestand hinzufügen",
    quickActionViewReports: "Berichte ansehen",
    brewEntryChooseRecipeSource: "Rezeptquelle wählen",
    brewEntryExistingRecipe: "Vorhandenes Rezept",
    brewEntryNewRecipe: "Neues Rezept",
    brewEntryChooseExistingRecipePath: "Pfad für vorhandenes Rezept wählen",
    brewEntrySelectExistingRecipe: "Vorhandenes Rezept auswählen",
    brewEntryUploadRecipe: "Rezept hochladen",
    brewEntryPlaceholderTitle: "Bald verfügbar",
    brewEntryPlaceholderDescription: "Dieser Einstiegspunkt ist für eine spätere Phase vorbereitet.",
    brewEntryBack: "Zurück",
    brewEntryClose: "Schließen",
    brewEntryUploadHelp: "Akzeptiert: PDF, Bild, Tabelle, Text, BeerXML, Brewfather-Export",
    brewEntryManualPaste: "Rezept manuell einfügen",
    brewEntrySelectFile: "Datei auswählen",
    brewEntryPrepareDraft: "Entwurf vorbereiten",
    brewEntryReadyBoundary: "Bereit zur Bestätigung",
    brewEntryDraftReadyDescription: "Entwurfsdaten sind vorbereitet. Bestätigung ist vor jedem Batch-Write erforderlich.",
    brewEntryNoWritesYet: "Es wurde noch kein Datenbank-Write ausgeführt.",
    brewEntryDemoDraftMode: "Demo-Modus: Entwurf ist simuliert und von Produktionsdaten getrennt.",
    brewEntrySelectedRecipePrefix: "Ausgewähltes Rezept",
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
    quickActionStartBrew: "Brouwen",
    quickActionLogFermentation: "Vergisting",
    quickActionAddInventory: "Voorraad toevoegen",
    quickActionViewReports: "Rapporten bekijken",
    brewEntryChooseRecipeSource: "Kies receptbron",
    brewEntryExistingRecipe: "Bestaand recept",
    brewEntryNewRecipe: "Nieuw recept",
    brewEntryChooseExistingRecipePath: "Kies pad voor bestaand recept",
    brewEntrySelectExistingRecipe: "Bestaand recept selecteren",
    brewEntryUploadRecipe: "Recept uploaden",
    brewEntryPlaceholderTitle: "Binnenkort beschikbaar",
    brewEntryPlaceholderDescription: "Dit startpunt staat klaar voor een volgende fase.",
    brewEntryBack: "Terug",
    brewEntryClose: "Sluiten",
    brewEntryUploadHelp: "Geaccepteerd: PDF, afbeelding, spreadsheet, tekst, BeerXML, Brewfather-export",
    brewEntryManualPaste: "Recept handmatig plakken",
    brewEntrySelectFile: "Bestand kiezen",
    brewEntryPrepareDraft: "Concept voorbereiden",
    brewEntryReadyBoundary: "Klaar om te bevestigen",
    brewEntryDraftReadyDescription: "Conceptpayload voorbereid. Bevestiging is vereist vóór een batch-write.",
    brewEntryNoWritesYet: "Er is nog geen database-write uitgevoerd.",
    brewEntryDemoDraftMode: "Demomodus: concept is gesimuleerd en gescheiden van productiedata.",
    brewEntrySelectedRecipePrefix: "Geselecteerd recept",
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
