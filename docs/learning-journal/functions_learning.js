const functionsLearningJournal = [
  {
    timestamp: "2026-09-22 20:27",
    functionName: "displayToast",
    filePath: "src/app/features/find-us/find-us.component.ts",
    codeSnippet: `displayToast(messageText: string, severityLevel: 'error' | 'success'): void {\n  if (this.toastTimerId) clearTimeout(this.toastTimerId);\n  this.toastMessage.set(messageText);\n  this.toastSeverity.set(severityLevel);\n  this.toastTimerId = setTimeout(() => this.toastMessage.set(null), 4000);\n}`,
    realWorldPurpose: "Ein digitaler Funkspruch-Lautsprecher an der Theke: Anstatt den Kunden anzuschreien und den ganzen Laden anzuhalten (wie der blockierende window.alert()), leuchtet kurz eine elegante Neon-Statusanzeige auf, informiert unaufdringlich und schaltet sich nach 4 Sekunden von selbst wieder ab.",
    stepByStepFlow: [
      "1. Bestehende Timer-Rennbedingungen abbrechen: Falls noch ein vorheriger Countdown aktiv ist (z. B. schneller Doppelklick), wird er mit clearTimeout(this.toastTimerId) sofort gestoppt, damit die Nachricht nicht vorzeitig verschwindet.",
      "2. Nachrichtensignal setzen: this.toastMessage.set(messageText) löst durch Angular 19 Signals sofort ein feinkörniges DOM-Update im Template aus (@if (toastMessage(); as messageText)).",
      "3. Schweregrad/Farbthema festlegen: this.toastSeverity.set(severityLevel) schaltet dynamisch die CSS-Klassen .error (#ef4444) oder .success (#22c55e) um.",
      "4. Automatisches Aufräumen: Ein neuer 4000ms Timer wird gestartet, der das Signal mit .set(null) zurücksetzt und das Element aus dem DOM entfernt."
    ],
    ahaMoment: "Timer-Kollision & Signal-Reaktivität: Ohne clearTimeout führt mehrfaches schnelles Klicken dazu, dass ein alter Timer die neue Nachricht nach wenigen Millisekunden schlagartig schließt. Durch Speichern von this.toastTimerId und das saubere Resetten bleibt das Signal exakt für die vollen 4 Sekunden sichtbar."
  }
];
