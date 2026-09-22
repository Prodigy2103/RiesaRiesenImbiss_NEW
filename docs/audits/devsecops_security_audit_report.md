# DevSecOps Security Audit Report (RiesaRiesenImbiss_NEW)

**Datum:** 2026-09-22  
**Geprüftes Repository:** `RiesaRiesenImbiss_NEW`  
**Standard:** 4-Pillar DevSecOps Audit (SAST, Supply Chain, Secrets, IaC & Cloud)  
**Status:** AUDIT ABGESCHLOSSEN – FINDINGS & REMEDIATIONS DOKUMENTIERT  

---

## Executive Summary

Im Rahmen des Security Audits wurde die gesamte Codebasis von `RiesaRiesenImbiss_NEW` gegen moderne DevSecOps-Standards und OWASP Top 10 Web Application Security Risiken geprüft. 

### Übersicht nach Kritikalität

| Säule | Kritikalität | Hauptbefund | Status |
| :--- | :---: | :--- | :---: |
| **1. SAST & Taint Protection** | **Medium** | `bypassSecurityTrustHtml` in `HighlightPipe` ohne vorangehendes HTML-Escaping | Remediation bereit |
| **2. Supply Chain & Dependencies** | **Medium / High** | 55 transitive Schwachstellen (hauptsächlich Dev-Dependencies: Vite, Webpack-Dev-Server, WS) | Analyse abgeschlossen |
| **3. Secrets & Credentials Push** | **Low / Safe** | Firebase API Key liegt in `environment.ts` (durch `.gitignore` geschützt) | Bestätigt |
| **4. IaC & Deployment Security** | **High** | Keine deklarierten Firestore Security Rules im Git-Repo (`firestore.rules` fehlt) | Sofortige Remediation empfohlen |

---

## Detaillierte Analyse nach den 4 Säulen

### Säule 1: SAST & Taint Analysis (Code-Ebene)

#### Befund 1.1: Mögliche XSS-Schwachstelle via `DomSanitizer.bypassSecurityTrustHtml`
- **Datei:** `src/app/shared/services/highlight.pipe.ts` (Zeile 16)
- **Problem:**
  ```typescript
  // Vorher:
  const cleanedResult = highlightedContent.replace(/^(<br>|<br\s*\/?>)*/i, '').trim();
  return this.sanitizer.bypassSecurityTrustHtml(cleanedResult);
  ```
  `bypassSecurityTrustHtml` schaltet Angulars integrierten Kontext-Sanitizer vollständig ab. Wenn der `inputText` (z. B. aus Inhaltsstoffen oder Textsuche) potenziell bösartige HTML-Tags (z. B. `<img src=x onerror=alert(1)>`) enthält, wird dieser Payload ungefiltert im Browser DOM ausgeführt.
- **Empfehlung (Remediation):**
  Den `inputText` vor dem Einfügen der Highlight-Tags (`<b>`) sicher HTML-encoden (Tags maskieren).

```typescript
// Sicherer Ansatz in HighlightPipe:
private escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
```

---

#### Befund 1.2: PII (Personally Identifiable Information) im Browser Storage
- **Dateien:** 
  - `src/app/shared/services/order.service.ts`
  - `src/app/features/order/order-summary/order-summary.component.ts`
- **Beobachtung:**
  Kundendaten (`CustomerData`: Name, Adresse, Telefonnummer) werden zur Bequemlichkeit im `localStorage` zwischengespeichert (`imbiss_customer`).
- **Bewertung:**
  - Positiv: Nach erfolgreicher Bestellung wird der Key via `localStorage.removeItem('imbiss_customer')` wieder bereinigt.
  - Hinweis: Auf öffentlichen/geteilten Geräten verbleiben Daten im Storage, falls der Kunde vor Abschluss abbricht. Das Parsing sollte zudem immer in einem `try-catch`-Block gekapselt sein, um korrupte JSON-Payloads abzufangen.

---

### Säule 2: Supply Chain & Dependencies

- **Audit-Befehl:** `npm audit --json`
- **Metrik:** 55 Vulnerabilities (0 Info, 3 Low, 20 Moderate, 29 High, 3 Critical).
- **Kontext & Einstufung:**
  - Sämtliche identifizierten Schwachstellen stammen aus **Dev-Dependencies** (`@angular-devkit/build-angular`, `karma`, `webpack-dev-server`, `vite`, `ws`).
  - Im Produktions-Bundle (`dist/`) sind diese Dev-Server-Pakete **nicht** enthalten.
- **Wichtigste Komponenten mit Advisory:**
  1. `vite` (<= 6.4.2): GHSA-fx2h-pf6j-xcff (Bypass on Windows alternate paths – relevant nur lokal bei Dev-Server).
  2. `ws` (Memory exhaustion DoS – relevant nur für lokalen HMR/Karma Testserver).
  3. `websocket-driver` (Critical – transitiv über Karma/SockJS).
- **Empfehlung:**
  Regelmäßiges Update über `npm update` bzw. Upgrade auf die jeweils aktuellen `@angular/cli`-Patches.

---

### Säule 3: Secrets & Credentials Push

- **Audit:** Suche nach hardcodierten API-Keys, Private Keys, Passwörtern und Token.
- **Ergebnis:**
  - `src/environments/environment.ts` enthält den Firebase Client API-Key:
    `apiKey: "AIzaSyB20ykQ1fm1VUGoKjUlCA_4JQ7MXTfCKUQ"`
  - **Prüfung Git-Status:** `.gitignore` enthält `src/environments/environment.ts` (Zeile 44). Die Datei wird nicht ins Remote-Repository übertragen.
  - **Architektur-Hinweis (Firebase API Keys):**
    Firebase API Keys identifizieren ein Google Cloud Projekt und sind konzeptionell öffentlich. Der eigentliche Zugriffsschutz muss zwingend über **Firestore Security Rules** und **App Check** erfolgen!

---

### Säule 4: Infrastructure as Code (IaC) & Cloud Security

#### Befund 4.1: Fehlende deklarative `firestore.rules` im Repository
- **Dateien:** `firebase.json`
- **Problem:**
  Im Workspace existiert keine `firestore.rules`-Datei. Falls die Firestore-Instanz im Firebase Console Dashboard auf offene Lese-/Schreibrechte ("Test Mode") konfiguriert ist, kann jeder beliebige Angreifer über die Firebase REST/Web API:
  - Sämtliche Bestellungen, Kundennamen, Adressen und Umsätze auslesen (`orders`, `archived-orders`).
  - Neue Bestellungen fälschen oder bestehende löschen.
- **Dringende Remediation:**
  Anlegen einer deklarativen `firestore.rules` Datei im Projekt und Verknüpfung in `firebase.json`.

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Öffentlicher Lesemodus für Menü & Zutaten
    match /categories/{category} {
      allow read: if true;
      allow write: if false;
    }
    match /items/{item} {
      allow read: if true;
      allow write: if false;
    }
    match /ingredient-details/{detail} {
      allow read: if true;
      allow write: if false;
    }

    // Bestellungen: Anonymes Erstellen erlaubt, Modifikation nur für Admin
    match /orders/{orderId} {
      allow create: if request.resource.data.status == 'new';
      allow read, update, delete: if request.auth != null;
    }
    
    // Archiv: Streng geschützt
    match /archived-orders/{archiveId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

#### Befund 4.2: Build-Output Pfad in `firebase.json`
- **Datei:** `firebase.json`
- **Ist-Zustand:** `"public": "dist/riesa-riesen-imbiss/browser"`
- **Soll-Zustand:** In `angular.json` generiert das Projekt nach `"dist/riesa-riesen-imbiss-new/browser"`.
- **Auswirkung:** Bei `firebase deploy` würde der falsche Ordner deployed werden.

---

## Sofortmaßnahmen-Plan (Remediation Checklist)

1. [x] **Projekt-AGENTS.md angelegt:** Pfade auf `docs/` in `RiesaRiesenImbiss_NEW` korrigiert.
2. [ ] **HighlightPipe Sanitization:** HTML-Escaping vor SafeHtml-Markierung einbauen.
3. [ ] **Firebase Hosting Path:** Pfad in `firebase.json` auf `dist/riesa-riesen-imbiss-new/browser` synchronisieren.
4. [ ] **Firestore Security Rules:** `firestore.rules` im Root anlegen und in `firebase.json` referenzieren.
