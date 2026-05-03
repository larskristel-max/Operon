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
  brewEntryPreparing: string;
  brewEntryPrepareFailed: string;
  brewEntryRetry: string;
  brewEntryReadyBoundary: string;
  brewEntryDraftReadyDescription: string;
  brewEntryConfirmationRequired: string;
  brewEntryRecipeLabel: string;
  brewEntryConfirm: string;
  brewEntryConfirmError: string;
  brewEntryCreatedTitle: string;
  brewEntryCreatedDescription: string;
  brewEntryLaunchedTitle: string;
  brewEntryBatchCreated: string;
  brewEntryContinue: string;
  brewEntryBackToDashboard: string;
  brewEntryDemoDraftMode: string;
  brewEntrySelectedRecipePrefix: string;
  brewEntryNoRecipesConnected: string;
  brewEntryNewRecipeComingSoon: string;
  brewEntryReadyToBrew: string;
  brewEntryDraftReadyStatus: string;
  brewEntryConfirmBrew: string;
  brewEntryVolumeLabel: string;
  brewEntryOgLabel: string;
  brewEntryYeastLabel: string;
  brewEntryMissingValue: string;
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
  // Batch overlay
  batches: string;
  batchesClose: string;
  batchesFilterActive: string;
  batchesFilterPlanned: string;
  batchesFilterArchived: string;
  batchesAllBatches: string;
  batchesSeeTasks: string;
  batchesBackToList: string;
  batchesNoneActive: string;
  batchesNonePlanned: string;
  batchesNoneArchived: string;
  batchesNoneMatchSub: string;
  // Brewsheet sections
  batchesEtat: string;
  batchesCuve: string;
  batchesIntrants: string;
  batchesNotAssigned: string;
  batchesToComplete: string;
  batchesStatus: string;
  batchesDayLabel: string;
  batchesOpenTasks: string;
  batchesBrewLogs: string;
  batchesFermentation: string;
  batchesOutputsLots: string;
  batchesLatestGravity: string;
  batchesReadings: string;
  batchesActionAssignTank: string;
  batchesActionAddIngredients: string;
  batchesActionAddBrewLog: string;
  batchesActionAddGravity: string;
  batchesActionCreateOutputLot: string;
  gravityActionLabel: string;
  gravityActionTitle: string;
  gravityFieldLabel: string;
  gravityTemperatureLabel: string;
  gravityConfirmError: string;
  gravityTempError: string;
  gravitySaveError: string;
  gravityLatestPrefix: string;
  gravityNoReading: string;
  taskRecordBoilLabel: string;
  // Tasks overlay
  tasksBatchTitle: string;
  tasksNeedsAction: string;
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
    quickActionLogFermentation: "Ferment",
    quickActionAddInventory: "Stock",
    quickActionViewReports: "Reports",
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
    brewEntryPreparing: "Preparing…",
    brewEntryPrepareFailed: "Preparation failed.",
    brewEntryRetry: "Retry",
    brewEntryReadyBoundary: "Ready to confirm",
    brewEntryDraftReadyDescription: "The draft is ready.",
    brewEntryConfirmationRequired: "Confirmation is required before creating the batch.",
    brewEntryRecipeLabel: "Recipe",
    brewEntryConfirm: "Confirm",
    brewEntryConfirmError: "Could not create batch. Try again.",
    brewEntryCreatedTitle: "BREW CREATED",
    brewEntryCreatedDescription: "The batch was created successfully.",
    brewEntryLaunchedTitle: "BREW LAUNCHED",
    brewEntryBatchCreated: "Batch created",
    brewEntryContinue: "Continue",
    brewEntryBackToDashboard: "Back to dashboard",
    brewEntryDemoDraftMode: "Demo mode: draft is simulated and isolated from production data.",
    brewEntrySelectedRecipePrefix: "Selected recipe",
    brewEntryNoRecipesConnected: "No recipes connected yet",
    brewEntryNewRecipeComingSoon: "New recipe builder coming soon.",
    brewEntryReadyToBrew: "READY TO BREW",
    brewEntryDraftReadyStatus: "Batch ready",
    brewEntryConfirmBrew: "Confirm brew",
    brewEntryVolumeLabel: "Volume",
    brewEntryOgLabel: "OG",
    brewEntryYeastLabel: "Yeast",
    brewEntryMissingValue: "To complete",
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
    batches: "BATCHES",
    batchesClose: "Close",
    batchesFilterActive: "Active",
    batchesFilterPlanned: "Planned",
    batchesFilterArchived: "Archived",
    batchesAllBatches: "All batches",
    batchesSeeTasks: "See tasks",
    batchesBackToList: "Back to list",
    batchesNoneActive: "No active batches",
    batchesNonePlanned: "No planned batches",
    batchesNoneArchived: "No archived batches",
    batchesNoneMatchSub: "No batches match this filter.",
    batchesEtat: "Status",
    batchesCuve: "Tank",
    batchesIntrants: "Ingredients",
    batchesNotAssigned: "Not assigned",
    batchesToComplete: "To complete",
    batchesStatus: "Status",
    batchesDayLabel: "Day",
    batchesOpenTasks: "Open tasks",
    batchesBrewLogs: "Brew logs",
    batchesFermentation: "Fermentation",
    batchesOutputsLots: "Outputs / Lots",
    batchesLatestGravity: "Latest gravity",
    batchesReadings: "Readings",
    batchesActionAssignTank: "Assign tank",
    batchesActionAddIngredients: "Add ingredients",
    batchesActionAddBrewLog: "Add brew log",
    batchesActionAddGravity: "Add gravity",
    batchesActionCreateOutputLot: "Create output lot",
    gravityActionLabel: "Gravity",
    gravityActionTitle: "Record gravity",
    gravityFieldLabel: "Gravity (e.g. 1.050 or 1050)",
    gravityTemperatureLabel: "Temp °C (optional)",
    gravityConfirmError: "Enter a valid gravity value (e.g. 1.020 or 1020).",
    gravityTempError: "Enter a valid temperature or leave blank.",
    gravitySaveError: "Failed to record gravity reading",
    gravityLatestPrefix: "Latest gravity",
    gravityNoReading: "To complete",
    taskRecordBoilLabel: "Record original gravity",
    tasksBatchTitle: "BATCH TASKS",
    tasksNeedsAction: "NEEDS ACTION",
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
    quickActionAddInventory: "Stock",
    quickActionViewReports: "Rapports",
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
    brewEntryPreparing: "Préparation…",
    brewEntryPrepareFailed: "La préparation a échoué.",
    brewEntryRetry: "Réessayer",
    brewEntryReadyBoundary: "Prêt à confirmer",
    brewEntryDraftReadyDescription: "Le brouillon est prêt.",
    brewEntryConfirmationRequired: "Une confirmation est requise avant création du lot.",
    brewEntryRecipeLabel: "Recette",
    brewEntryConfirm: "Confirmer",
    brewEntryConfirmError: "Impossible de créer le lot. Réessayez.",
    brewEntryCreatedTitle: "BRASSAGE CRÉÉ",
    brewEntryCreatedDescription: "Le lot a été créé avec succès.",
    brewEntryLaunchedTitle: "BRASSAGE LANCÉ",
    brewEntryBatchCreated: "Batch créé",
    brewEntryContinue: "Continuer",
    brewEntryBackToDashboard: "Retour au tableau",
    brewEntryDemoDraftMode: "Mode démo : le brouillon est simulé et isolé des données de production.",
    brewEntrySelectedRecipePrefix: "Recette sélectionnée",
    brewEntryNoRecipesConnected: "Aucune recette connectée pour le moment",
    brewEntryNewRecipeComingSoon: "Le builder de nouvelle recette arrive bientôt.",
    brewEntryReadyToBrew: "PRÊT À BRASSER",
    brewEntryDraftReadyStatus: "Batch prêt",
    brewEntryConfirmBrew: "Confirmer le brassage",
    brewEntryVolumeLabel: "Volume",
    brewEntryOgLabel: "OG",
    brewEntryYeastLabel: "Levure",
    brewEntryMissingValue: "À compléter",
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
    batches: "BATCHS",
    batchesClose: "Fermer",
    batchesFilterActive: "Actifs",
    batchesFilterPlanned: "Planifiés",
    batchesFilterArchived: "Archivés",
    batchesAllBatches: "Tous les batchs",
    batchesSeeTasks: "Voir les tâches",
    batchesBackToList: "Retour à la liste",
    batchesNoneActive: "Aucun batch actif",
    batchesNonePlanned: "Aucun batch planifié",
    batchesNoneArchived: "Aucun batch archivé",
    batchesNoneMatchSub: "Aucun batch dans ce filtre.",
    batchesEtat: "État",
    batchesCuve: "Cuve",
    batchesIntrants: "Ingrédients",
    batchesNotAssigned: "Non assigné",
    batchesToComplete: "À compléter",
    batchesStatus: "Statut",
    batchesDayLabel: "Jour",
    batchesOpenTasks: "Tâches ouvertes",
    batchesBrewLogs: "Journaux de brassage",
    batchesFermentation: "Fermentation",
    batchesOutputsLots: "Sorties / Lots",
    batchesLatestGravity: "Dernière densité",
    batchesReadings: "Mesures",
    batchesActionAssignTank: "Assigner une cuve",
    batchesActionAddIngredients: "Ajouter des ingrédients",
    batchesActionAddBrewLog: "Ajouter un journal",
    batchesActionAddGravity: "Ajouter une densité",
    batchesActionCreateOutputLot: "Créer un lot de sortie",
    gravityActionLabel: "Densité",
    gravityActionTitle: "Enregistrer la densité",
    gravityFieldLabel: "Densité (ex. 1.050 ou 1050)",
    gravityTemperatureLabel: "Temp °C (optionnel)",
    gravityConfirmError: "Entrez une densité valide (ex. 1.020 ou 1020).",
    gravityTempError: "Entrez une température valide ou laissez vide.",
    gravitySaveError: "Échec de l’enregistrement de la densité",
    gravityLatestPrefix: "Dernière densité",
    gravityNoReading: "À compléter",
    taskRecordBoilLabel: "Enregistrer densité initiale",
    tasksBatchTitle: "TÂCHES DU BATCH",
    tasksNeedsAction: "ACTIONS REQUISES",
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
    quickActionAddInventory: "Bestand",
    quickActionViewReports: "Berichte",
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
    brewEntryPreparing: "Wird vorbereitet…",
    brewEntryPrepareFailed: "Vorbereitung fehlgeschlagen.",
    brewEntryRetry: "Erneut versuchen",
    brewEntryReadyBoundary: "Bereit zur Bestätigung",
    brewEntryDraftReadyDescription: "Der Entwurf ist bereit.",
    brewEntryConfirmationRequired: "Eine Bestätigung ist erforderlich, bevor die Charge erstellt wird.",
    brewEntryRecipeLabel: "Rezept",
    brewEntryConfirm: "Bestätigen",
    brewEntryConfirmError: "Charge konnte nicht erstellt werden. Bitte erneut versuchen.",
    brewEntryCreatedTitle: "SUD ERSTELLT",
    brewEntryCreatedDescription: "Die Charge wurde erfolgreich erstellt.",
    brewEntryLaunchedTitle: "SUD GESTARTET",
    brewEntryBatchCreated: "Charge erstellt",
    brewEntryContinue: "Weiter",
    brewEntryBackToDashboard: "Zurück zur Übersicht",
    brewEntryDemoDraftMode: "Demo-Modus: Entwurf ist simuliert und von Produktionsdaten getrennt.",
    brewEntrySelectedRecipePrefix: "Ausgewähltes Rezept",
    brewEntryNoRecipesConnected: "Noch keine Rezepte verbunden",
    brewEntryNewRecipeComingSoon: "Neuer Rezept-Builder kommt bald.",
    brewEntryReadyToBrew: "BEREIT ZUM BRAUEN",
    brewEntryDraftReadyStatus: "Batch bereit",
    brewEntryConfirmBrew: "Sud bestätigen",
    brewEntryVolumeLabel: "Volumen",
    brewEntryOgLabel: "OG",
    brewEntryYeastLabel: "Hefe",
    brewEntryMissingValue: "Ausfüllen",
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
    batches: "BATCHES",
    batchesClose: "Schließen",
    batchesFilterActive: "Aktiv",
    batchesFilterPlanned: "Geplant",
    batchesFilterArchived: "Archiviert",
    batchesAllBatches: "Alle Batches",
    batchesSeeTasks: "Aufgaben ansehen",
    batchesBackToList: "Zurück zur Liste",
    batchesNoneActive: "Keine aktiven Batches",
    batchesNonePlanned: "Keine geplanten Batches",
    batchesNoneArchived: "Keine archivierten Batches",
    batchesNoneMatchSub: "Keine Batches gefunden.",
    batchesEtat: "Status",
    batchesCuve: "Tank",
    batchesIntrants: "Zutaten",
    batchesNotAssigned: "Nicht zugewiesen",
    batchesToComplete: "Ausfüllen",
    batchesStatus: "Status",
    batchesDayLabel: "Tag",
    batchesOpenTasks: "Offene Aufgaben",
    batchesBrewLogs: "Brauprotokolle",
    batchesFermentation: "Gärung",
    batchesOutputsLots: "Ausgaben / Lots",
    batchesLatestGravity: "Letzte Dichte",
    batchesReadings: "Messungen",
    batchesActionAssignTank: "Tank zuweisen",
    batchesActionAddIngredients: "Zutaten hinzufügen",
    batchesActionAddBrewLog: "Braulog hinzufügen",
    batchesActionAddGravity: "Dichte hinzufügen",
    batchesActionCreateOutputLot: "Ausgabelot erstellen",
    gravityActionLabel: "Dichte",
    gravityActionTitle: "Dichte erfassen",
    gravityFieldLabel: "Dichte (z. B. 1.050 oder 1050)",
    gravityTemperatureLabel: "Temp °C (optional)",
    gravityConfirmError: "Gib eine gültige Dichte ein (z. B. 1.020 oder 1020).",
    gravityTempError: "Gib eine gültige Temperatur ein oder leer lassen.",
    gravitySaveError: "Dichtemessung konnte nicht gespeichert werden",
    gravityLatestPrefix: "Letzte Dichte",
    gravityNoReading: "Ausfüllen",
    taskRecordBoilLabel: "Stammwürze erfassen",
    tasksBatchTitle: "CHARGEN-AUFGABEN",
    tasksNeedsAction: "AKTION ERFORDERLICH",
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
    quickActionAddInventory: "Voorraad",
    quickActionViewReports: "Rapporten",
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
    brewEntryPreparing: "Voorbereiden…",
    brewEntryPrepareFailed: "Voorbereiden mislukt.",
    brewEntryRetry: "Opnieuw proberen",
    brewEntryReadyBoundary: "Klaar om te bevestigen",
    brewEntryDraftReadyDescription: "Het concept is klaar.",
    brewEntryConfirmationRequired: "Bevestiging is vereist voordat de batch wordt aangemaakt.",
    brewEntryRecipeLabel: "Recept",
    brewEntryConfirm: "Bevestigen",
    brewEntryConfirmError: "Kon batch niet aanmaken. Probeer opnieuw.",
    brewEntryCreatedTitle: "BROUWSEL AANGEMAAKT",
    brewEntryCreatedDescription: "De batch is succesvol aangemaakt.",
    brewEntryLaunchedTitle: "BROUWSEL GESTART",
    brewEntryBatchCreated: "Batch aangemaakt",
    brewEntryContinue: "Doorgaan",
    brewEntryBackToDashboard: "Terug naar dashboard",
    brewEntryDemoDraftMode: "Demomodus: concept is gesimuleerd en gescheiden van productiedata.",
    brewEntrySelectedRecipePrefix: "Geselecteerd recept",
    brewEntryNoRecipesConnected: "Nog geen recepten gekoppeld",
    brewEntryNewRecipeComingSoon: "Nieuwe receptbouwer komt binnenkort.",
    brewEntryReadyToBrew: "KLAAR OM TE BROUWEN",
    brewEntryDraftReadyStatus: "Batch klaar",
    brewEntryConfirmBrew: "Brouwsel bevestigen",
    brewEntryVolumeLabel: "Volume",
    brewEntryOgLabel: "OG",
    brewEntryYeastLabel: "Gist",
    brewEntryMissingValue: "Aan te vullen",
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
    batches: "BATCHES",
    batchesClose: "Sluiten",
    batchesFilterActive: "Actief",
    batchesFilterPlanned: "Gepland",
    batchesFilterArchived: "Gearchiveerd",
    batchesAllBatches: "Alle batches",
    batchesSeeTasks: "Taken bekijken",
    batchesBackToList: "Terug naar lijst",
    batchesNoneActive: "Geen actieve batches",
    batchesNonePlanned: "Geen geplande batches",
    batchesNoneArchived: "Geen gearchiveerde batches",
    batchesNoneMatchSub: "Geen batches gevonden.",
    batchesEtat: "Status",
    batchesCuve: "Tank",
    batchesIntrants: "Ingrediënten",
    batchesNotAssigned: "Niet toegewezen",
    batchesToComplete: "Aan te vullen",
    batchesStatus: "Status",
    batchesDayLabel: "Dag",
    batchesOpenTasks: "Openstaande taken",
    batchesBrewLogs: "Brouwlogs",
    batchesFermentation: "Vergisting",
    batchesOutputsLots: "Output / Lots",
    batchesLatestGravity: "Laatste dichtheid",
    batchesReadings: "Metingen",
    batchesActionAssignTank: "Tank toewijzen",
    batchesActionAddIngredients: "Ingrediënten toevoegen",
    batchesActionAddBrewLog: "Brouwlog toevoegen",
    batchesActionAddGravity: "Dichtheid toevoegen",
    batchesActionCreateOutputLot: "Outputlot maken",
    gravityActionLabel: "Dichtheid",
    gravityActionTitle: "Dichtheid registreren",
    gravityFieldLabel: "Dichtheid (bijv. 1.050 of 1050)",
    gravityTemperatureLabel: "Temp °C (optioneel)",
    gravityConfirmError: "Voer een geldige dichtheid in (bijv. 1.020 of 1020).",
    gravityTempError: "Voer een geldige temperatuur in of laat leeg.",
    gravitySaveError: "Dichtheidsmeting opslaan mislukt",
    gravityLatestPrefix: "Laatste dichtheid",
    gravityNoReading: "Aan te vullen",
    taskRecordBoilLabel: "Begin SG registreren",
    tasksBatchTitle: "BATCH TAKEN",
    tasksNeedsAction: "ACTIE VEREIST",
  },
};

export function getDashboardCopy(language: Language): DashboardCopy {
  if (language === "fr" || language === "de" || language === "nl") {
    return dashboardCopy[language];
  }
  return dashboardCopy.en;
}
