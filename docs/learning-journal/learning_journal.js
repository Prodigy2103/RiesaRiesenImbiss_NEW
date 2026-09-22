const learningJournalData = [
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
