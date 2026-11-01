const learningJournalData = [
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
