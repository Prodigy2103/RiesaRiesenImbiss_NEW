const learningJournalData = [
  {
    date: "2026-11-12",
    title: "Firestore-Synchronisation menuItems_New, Kategorien-Restrukturierung mit festen Slugs & Archivierungs-Fix",
    tasks: [
      "Behebung des Permission-Fehlers bei der Bestell-Archivierung (OrderArchiveService): firestore.rules um CamelCase-Collection archivedOrders erweitert und live deployed",
      "Vollständige Analyse der neuen Speisekarte anhand des Kundenfotos (83 nummerierte Gerichte in 15 Speisekategorien)",
      "Befüllung & Bereinigung von menuItems_New in Firestore: 65 alte/gestrichene Dokumente gelöscht, 104 finale Gerichte und Getränke konsistent mit festen IDs ({nr}-{slug}) eingepflegt",
      "Integration von 6 Neuzugängen: Pide mit Schafskäse & Pizzakäse, Pide Thunfisch, Pide Veggie, Taco Thunfisch, Pommes (klein/groß) und Pizza Hähnchenfleisch",
      "Restrukturierung der categories-Sammlung: Ersetzung aller 17 Zufalls-IDs durch sprechende Slugs nach label (doener, salat, tacos, etc.) und lückenlose Reihenfolge (order: 1 bis 17) nach dem neuen Flyer",
      "Aktualisierung von TACO_ID in OrderFlowComponent und Unit-Tests auf den neuen festen Slug 'tacos' (59/59 Tests grün)",
      "Wiederherstellung des Read-Only Schreibschutzes für menuItems_New und categories in firestore.rules"
    ],
    learnings: [
      "Atomare Firestore-Batches & Security Rules: Schlägt eine einzelne Operation im writeBatch fehl (hier set auf archivedOrders wegen Kebab-Case Diskrepanz), scheitert der gesamte Batch inklusive des delete auf orders. Rules müssen exakt dem Code-Schema entsprechen.",
      "Sprechende Dokument-IDs statt Zufalls-Hashes: Feste Slugs wie {nr}-{slug} für Menüartikel und label-Slugs für Kategorien erleichtern das Debugging, machen DB-Lookups transparent und verhindern hardcodierte Magic-Strings wie TACO_ID = 'CVnnpJ5lvCwIeOHeEc0Z'.",
      "Strikte Branch- und Feature-Isolierung: Durch die saubere Trennung von Schema-Updates (menuItems_New_create) und UI-Experimenten (test_newDesign_pickCard) kann die Datenbasis unabhängig vom Freigabestatus neuer Benutzeroberflächen gepflegt werden."
    ],
    openTodos: [
      "Kunden-Feedback zur neuen Speisekarte im laufenden Betrieb beobachten",
      "Nach Kundenabnahme des neuen Bistro-Split Designs: Integration in den Hauptentwicklungszweig"
    ]
  },
  {
    date: "2026-11-09",
    title: "Lighthouse 100/100 Audit-Loop, Bistro-Split Menü-Redesign, Responsive Title Fix & Branch-Separation",
    tasks: [
      "Playwright-Lighthouse Audit-Loop (Regel 17): Erfolgreicher Lauf mit 100/100 Accessibility, 100/100 Best Practices und 100/100 SEO",
      "Asset- & Performance-Optimierung: Logo von 2.9 MB auf 141 KB und TikTok-Icon von 211 KB auf 2.4 KB komprimiert; GPU-kompatible Transitions statt endloser Box-Shadow-Keyframes",
      "TypeScript- & CSS-Konfigurations-Bereinigung: e2e-Ausschluss in root tsconfig.json, separates e2e/tsconfig.json und standardkonformes line-clamp: 2",
      "Neues Bistro-Split Menü-Design auf Branch test_newDesign_pickCard: Split-Ansicht mit Sticky Hero-Karte und kompakter Flyer-Liste",
      "Behebung des Titel-Abschneidens in der Flyer-Liste (460px, 768px, 1211px): 2-Zeilen-Layout auf Mobile/Tablet (Titel volle Breite oben, Preis + Button unten), flexibler 2-Zeilen-Umbruch auf Desktop",
      "Firestore-Migration menuItems_New & saubere Branch-Trennung: Klassisches 8-Karten-Design auf menuItems_New_create gepflegt, getestet und nach GitHub gepusht; Neues Design separat auf test_newDesign_pickCard gesichert"
    ],
    learnings: [
      "Responsive Dot-Leader & Flexbox: Punktelinien (border-bottom: dotted) in einzeiligen Flex-Containern erzwingen bei langen Titeln extremes Abschneiden. Auf Mobilgeräten (<= 768px) ist ein zweizeiliges Grid/Flex-Layout mit voller Titelbreite oben und Preis/CTA unten die barriereärmste und lesbarste Lösung.",
      "Lighthouse Best Practices & Asset-Größen: Hochauflösende Rohgrafiken belasten LCP und Transfer massiv. Präzise Dimensionierung und Komprimierung heben Performance und Best-Practices-Scores sofort auf das 100er-Niveau.",
      "Branching-Hygiene bei Kundenabnahmen: Wenn ein Design-Redesign erst durch den Kunden freigegeben werden muss, dürfen Schema-Änderungen (neue Firestore-Kollektion menuItems_New) das alte Design nicht blockieren. Die Trennung in test_newDesign_pickCard und menuItems_New_create garantiert sofortige Rollout-Fähigkeit."
    ],
    openTodos: [
      "Feedback und finale Abnahme des neuen Bistro-Split Menüs durch den Kunden einholen",
      "Nach Kundenfreigabe: Merge von test_newDesign_pickCard in den Hauptentwicklungszweig"
    ]
  },
  {
    date: "2026-11-03",
    title: "Tagesabschluss-Bon Aufteilung (Option 2), Lieferzeiten-Verlängerung & Card-Line-Clamping",
    tasks: [
      "Implementierung von Option 2 im Tagesabschluss-Bon (OrderArchiveComponent): Getrennte Blöcke für Abholung und Lieferung mit Artikel-Stückzahlen und Einzelumsätzen",
      "Erstellung des kanonischen Interfaces ProductSalesRow (order.model.ts) und reaktiver computed()-Signals für Verkaufsstatistiken (Zero-any, max. 14 Zeilen)",
      "Thermodrucker-Layout (70mm) mit Monospace-Typografie, markanten Block-Badges und korrekter Platzierung von 7%/19% MwSt und Gesamtumsatz",
      "Verlängerung der Lieferservice-Zeiten in isWithinDeliveryHours: Mo–Sa bis 21:00 Uhr und So bis 19:30 Uhr mit automatischer Button-Sperre außerhalb der Zeiten",
      "Synchronisation der Lieferzeiten-Badges über OrderSummaryComponent, HeroThreeComponent und FindUsComponent",
      "Behebung des line-clamp-Konflikts in OrderFlowComponent (-webkit-line-clamp: 3 vs line-clamp: 2) und Optimierung der Kartenhöhen für 3-zeilige Titel + Preis",
      "Vollständige Absicherung aller Änderungen über Unit Tests in OrderArchiveComponent (3/3 grün) und OrderSummaryComponent (5/5 grün)"
    ],
    learnings: [
      "CSS Line-Clamp Präzedenz: Wenn -webkit-line-clamp: 3 und standardisiertes line-clamp: 2 deklariert sind, greift in modernen Browsern der Standardwert und schneidet fälschlicherweise nach 2 Zeilen ab. Beide Deklarationen müssen konsistent sein.",
      "Karten-Höhenverteilung bei flex-direction: column: Wenn ein oberer Container (wie .image-container) eine feste Höhe von 80% beansprucht, führt zusätzlicher Text im unteren Container (.card-info) unweigerlich zu Überlauf und Abschneiden bei overflow: hidden.",
      "Reaktive Signal-Aggregation: Komplexe Statistiken wie Artikel-Verkaufszahlen lassen sich durch schlanke computed()-Pipelines mit Maps und Single-Responsibility-Helfern wartbar und unter 14 Zeilen pro Methode umsetzen.",
      "Thermodrucker-UX: Für 70mm Bondrucker sind Monospace-Schriftarten ('Courier New', monospace) essenziell, um Zahlen und Preise spaltengetreu ohne Layout-Verschiebungen auszurichten."
    ],
    openTodos: [
      "Finaler Check der gedruckten Thermo-Bons im realen Schichtbetrieb",
      "Eventuelle weitere Detail-Anpassungen an Produktkarten im Orderflow bei noch längeren Titeln"
    ]
  },
  {
    date: "2026-11-01",
    title: "Lieferservice-Launch, Adressvalidierung, Hausgemachte Pizza & Tagesabschluss-Steuersplitting",
    tasks: [
      "Freischaltung des Lieferservice-Modus in OrderSummaryComponent inklusive Mindestbestellwert-Anpassung für PLZ 01589 auf 20 €",
      "Robuste Straßen- und Hausnummern-Validierung (isValidDeliveryAddress) in DataService und OrderSummaryComponent mit Live-UI-Feedback",
      "Reaktive Standard-Liefer-/Abholzeit (+45 Min.) mit 15s-Live-Sync (DestroyRef-Cleanup) und Unterstützung manueller Wunschzeiten (isCustomTimeSelected)",
      "Zeitfenstergesteuerte Aktivierung des Liefer-Buttons (isWithinDeliveryHours: Mo–Sa 11–20 Uhr, So 13–19 Uhr)",
      "Integration der neuen Kategorie 'Hausgemachte Pizza' inklusive Pfad-Normalisierung (normalizeCategory) und 'Extrawunsch'-Kennzeichnung für Saucen (100, 101, 102)",
      "Erweiterung des Tagesabschluss-Bons (OrderArchiveComponent) um die Trennung nach Abholung/Lieferung sowie 7% MwSt (Speisen) und 19% MwSt (Getränke)",
      "Einbau des Lieferservice-HUD-Banners und der Lieferzeiten in HeroThreeComponent, OrderSummaryComponent und FindUsComponent",
      "Küchen-Bon im KitchenInternalMonitor: Unterscheidung '*** LIEFERUNG ***' / '*** ABHOLUNG ***', Lieferadresse nur bei Lieferung, LIEFERZEIT vs. ABHOLZEIT",
      "Unsichtbare Scrollbar in HeroThreeComponent ab 1440px (hide-scrollbar Mixin) inklusive Behebung der Höhenkette (main 90dvh -> HeroSectionComponent -> HeroThreeComponent)",
      "Merge von Harness_Code_Review in master sowie OmniRoute-Update auf v3.8.52 (EBUSY-Lock behoben, 16 DB-Migrationen)"
    ],
    learnings: [
      "Defense in Depth bei Adressvalidierung: Eine reine Längenprüfung (> 10 Zeichen) lässt Eingaben ohne Hausnummer oder reine PLZ-Angaben durch; ein strukturierter Regex für Straße + 1-4-stellige Hausnummer sichert UI und Service-Layer gleichermaßen ab.",
      "Reaktive Zeitberechnung & DestroyRef: Live mitlaufende Uhrzeiten über setInterval müssen zwingend mit DestroyRef.onDestroy bereinigt werden, während ein separates Signal (isCustomTimeSelected) manuelle Nutzereingaben vor dem Überschreiben schützt.",
      "Umsatzsteuer-Splitting im Kassenabschluss: Außer-Haus-Speisen (Abholung & Lieferung) unterliegen 7% MwSt, Getränke ('bottle', 'alkfree') jedoch 19% MwSt (Brutto / 1.19).",
      "Single Source of Truth für Extra-Filter: Statische Ausschlusslisten gehören in zentrale Datenmodule (CATEGORY_EXTRA_EXCLUSIONS in extras.data.ts) statt in mehrfach neu aufgebaute lokale Objekte innerhalb von computed()-Signals.",
      "Scroll-Container brauchen eine feste Höhenkette: overflow-y: auto greift nur, wenn jeder Elternteil eine definierte Höhe hat und der Container selbst nicht größer als der sichtbare Bereich (hier 90dvh) ist.",
      "Testbarkeit durch injizierbare Zeit: calculateMinTime(referenceDate) erlaubt Unit-Tests und Konsolen-Checks außerhalb der echten Lieferzeiten, ohne die Systemuhr zu manipulieren."
    ],
    openTodos: [
      "Hinterlegen der finalen Pizza-Gerichte in der Firestore-Collection menuItems",
      "Optionaler Austausch der Telefonnummern- und Social-Media-Platzhalter im Footer"
    ]
  },
  {
    date: "2026-09-22",
    title: "DevSecOps Audit, Army-of-Juniors Refactoring, E2E/UX Audit & Cyberpunk UI Polish",
    tasks: [
      "Synchronisation & Bereinigung der globalen und projektbezogenen AGENTS.md Standards",
      "DevSecOps Security Audit: XSS-Absicherung der HighlightPipe (escapeHtml) & Erstellung produktionsreifer firestore.rules",
      "Army-of-Juniors 10-Dimensionen-Audit: Vollständige Behebung von Shadow-Types, Code-Duplikation, Storage-Parsing-Risiken und Zeitzonenfehlern",
      "Einführung des kanonischen Domain-Models Comment (comment.model.ts) und des ReviewService als Single Source of Truth",
      "Entwicklung robuster Utilities: safeJsonParse (storage.util.ts) und formatLocalDateIso (date.util.ts) mit 100% Testabdeckung",
      "E2E & UX Audit mit Playwright auf Desktop (1920x1080) und Mobile (390x844) erfolgreich durchgeführt (Score A+)",
      "Behebung mobiler Touch-Targets gemäß WCAG 2.5.5 (44x44px) im Header (.nav-link) und Footer (.social-icon-link, .footer-row)",
      "Ersetzung des nativen window.alert() durch eine signal-gesteuerte Cyberpunk-Toast-Benachrichtigung in FindUsComponent",
      "Erweiterung der Test-Suite auf 50 erfolgreiche Unit-Tests (50/50 grün) und erfolgreicher Produktions-Build in 7.3s"
    ],
    learnings: [
      "Signals & Feinkörnige Reaktivität: Lokale Signal-Zustände (toastMessage, toastSeverity) ermöglichen reaktive UI-Feedbacks ohne ChangeDetectorRef oder DOM-Manipulation.",
      "Timer-Rennbedingungen (Race Conditions): Schnelles mehrfaches Triggern erfordert clearTimeout(timerId), um vorzeitiges Ausblenden bei neuen Benutzeraktionen zu verhindern.",
      "WCAG 2.5.5 Touch Targets: Mobile Touch-Targets müssen mindestens 44x44px groß sein; durch CSS-Eigenschaften wie min-height/min-width in Kombination mit inline-flex wird dies ohne optischen Bruch elegant gelöst.",
      "DST & Zeitzonensicherheit: toISOString().split('T')[0] schneidet in UTC ab. Lokale Kalendertage erfordern getFullYear(), getMonth() und getDate(), um Datumsversätze um Mitternacht zu verhindern.",
      "Clean Code & Single Source of Truth: UI-Komponenten dürfen weder direkt auf localStorage zugreifen noch Geschäftslogik duplizieren; Kapselung in dedizierten Services wahrt Separation of Concerns."
    ],
    openTodos: [
      "Optionale Umstellung von Inline-Bilddimensionen für Social-Media-Icons zur Unterdrückung von NG0913/NG02952-Warnungen",
      "Erweiterung des Kitchen-Internal Monitors um akustische Signal-Hinweise bei Bestelleingang"
    ]
  }
];

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { learningJournalData };
}
