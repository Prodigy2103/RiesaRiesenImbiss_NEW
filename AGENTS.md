# Project Agent Guidelines & Execution Standards (RiesaRiesenImbiss_NEW)

## 1. Code Quality & Architecture
- **Language Policy:** Chat interactions and explanations in German. Code, variable names, parameter names, function names, comments, and commit messages strictly in English.
- **Function Length & Single Responsibility:**
  - Maximum 14 lines per function/method.
  - **Decomposition over Density:** Keep functions short through focused helper methods (Single Responsibility), never through dense, unreadable one-liners.
  - **Modern Idioms:** Use guard clauses, early returns, modern operators (`?.`, `??`), and clean functional pipelines (`map`, `filter`) to eliminate deep nesting.
  - **No Code Golf:** Readability, debuggability, and type safety must never be sacrificed for line count.
- **Strict No-any Policy:** The `any` type is strictly forbidden across both production files and `.spec.ts` test files.
- **Naming Conventions:** Descriptive, unambiguous naming. Single-letter variables (`e`, `i`, `x`, `c`, `s`, `m`, `q`, `o`) and cryptic abbreviations (`res`, `req`, `temp`, `data`, `cur`, `prev`) are strictly prohibited.
- **Signals & Modern Angular:** Angular 19/21 Signals (`signal`, `computed`, `linkedSignal`), modern Control Flow (`@if`, `@for`, `@switch`), and Standalone Components (`standalone: true`).
- **UI State & Signal Primitives:** Always prefer signal-based state primitives for modals, dropdowns, drawers, and item selections instead of writing repetitive toggle/open/close boilerplate.
- **SCSS File Limit & Design System Mixins (Boy-Scout Rule):** Maximum 400 lines per `.scss` file. New components must strictly remain under 400 lines. When touching legacy stylesheets over 400 lines, actively refactor them below 400 lines by decomposing into partials (e.g. `_order-modal.scss`, `_order-summary-list.scss`), using utility classes, or leveraging shared mixins from `public/styles/` via `@use "all_styles" as all;`. Never duplicate boilerplate CSS.

## 1.1. Interactive Pair-Programming & Learning Workflow
When a new feature, service, or state logic is requested, strictly adhere to this 4-step workflow:

- **Step 1 (Scaffolding):** Build exclusively the TypeScript framework (interfaces, signatures, signals). Leave the core logic empty (`// TODO: Implementation`).
- **Step 2 (Architectural Decision):** Propose 2 solution approaches (Approach A vs. Approach B). Stop immediately and wait for user decision and code proposal.
- **Step 3 (Solution & Tests):** Critically evaluate the user's choice. Deliver the full, clean code (maximum 14 lines per function) including `.spec.ts` tests.
- **Step 4 (Knowledge Test):** Immediately ask 3 to 5 targeted questions regarding functionality, signals, and type safety.

> **Exception:** If complete, up-to-date code is provided directly by the user, skip Steps 1 and 2 and start directly with Step 3.

## 1.2. Sparring Partner Mode: Anti-Sycophancy & Direct Feedback

- **No Sycophancy ("No Yes-Man"):** Never validate statements, architectural decisions, or code proposals out of politeness.
- **Critical Evaluation as Default:**
  - When an approach is selected in Step 2 or code is proposed, **actively search for weaknesses**:
    - *Are there hidden edge cases (null/undefined, race conditions)?*
    - *Is the Signal reactivity model broken or overcomplicated?*
    - *Are Clean Code, DRY principles, or the 14-line limit violated?*
    - *Are there potential performance bottlenecks, N+1 issues, or unnecessary re-renders?*
- **Obligation to Object:**
  - If the proposed solution is not objectively the cleanest implementation, **you must object**.
  - **Objection Structure:**
    1. **Objection:** Explain why the approach is problematic or suboptimal.
    2. **Counterexample:** Provide a concrete edge case where the proposal fails.
    3. **Superior Solution:** Present the better alternative with technical justification.
- **Earned Praise Only:** Agree with proposals only if the code has no architectural or functional flaws.

## 1.3. Anti-Patterns Prevention Guardrails (OX Security: "Army of Juniors")
To prevent architectural degradation, security backdoors, and synthetic technical debt, every agent must strictly observe these 10 anti-pattern prevention guardrails:

1. **No Navigation Comments (Self-Documenting Code):**
   - Prohibit trivial inline comments that merely describe syntax or serve as AI navigation anchors.
   - Comments are exclusively reserved for non-obvious business/regulatory rules or external API edge cases.
2. **Never Pile Workarounds (Refactor at the Root):**
   - When schemas or services fall short, refactor the underlying core model or service cleanly rather than stacking nested if-else ladders or temporary wrappers.
3. **Single Source of Truth (No Disposable Shadow Types):**
   - Never declare duplicate or shadow models/interfaces inside components. Reuse and extend canonical domain models from `src/app/shared/modals/`.
4. **Strict UI & Domain Decoupling (No Monolithic Components):**
   - UI components must never contain raw business algorithms, direct complex query builders, or data synchronizers. Delegate to dedicated services.
5. **Authentic Unit Testing (Zero Hallucinated Specs):**
   - Unit tests (`.spec.ts`) must test the actual declared component/service logic and edge cases. Fake testbeds (testing a different component) or self-testing dummy functions inside specs are strictly forbidden.
6. **Zero Phantom Bloat & Strict Comparison:**
   - Avoid bloated defensive guards against impossible types. Ensure type comparisons match actual runtime schemas.
7. **Battle-Tested Utilities (DST-Safe Date Math):**
   - Never perform naive date math (e.g. `getTime() / 86400000`). Always ensure timezone and daylight saving time (DST) safety when manipulating timestamps.
8. **Zero Duplication of Calculations & Filters:**
   - Calculations for order totals, discounts, ingredient mapping, and price calculations must exist in exactly one place.
9. **Strict Environment Parity:**
   - Production secrets, endpoints, and flags must be managed through typed configurations (`environment.ts` / `environment.prod.ts`). Never hardcode debug URLs or mocks in production bundles.
10. **Security by Default (No Leaks / Clean Firestore Writes):**
    - Never store unencrypted credentials or sensitive customer payloads in `localStorage`.
    - Always handle and bubble database write errors cleanly; never swallow them silently with `console.warn`.

## 1.4. Mandatory Security Guardrails (DevSecOps)

The following security rules apply without exception to every code generation, refactoring, and code review:

1. **Automated Security Audit Before Code Delivery:**
   - **Secrets & Credentials:** Never commit or store API keys, private keys, bearer tokens, or passwords in source code—including placeholder strings in tests. Always use typed environment configurations.
   - **SAST & Taint Protection:** Any external user input (form fields, query strings, local storage payloads, API payloads) is considered untrusted and must be strictly typed, sanitized, and parameterized (no unescaped HTML bypass pipes, no raw DOM concatenations).
   - **Dependencies & Supply Chain:** Only established packages without risky lifecycle scripts are allowed when suggesting or importing packages. Vulnerable methods must not be imported; typosquatting must be verified beforehand.
   - **Pipeline & IaC:** Dockerfiles must run as non-root users. CI/CD actions (e.g., GitHub Actions) must be pinned to full 40-character commit SHAs (hash pinning).

2. **Activation of Modular Skills:**
   - For security inquiries, reviews, or infrastructure tasks, the agent must consult the specialized skills (`security-sast-audit`, `security-supply-chain`, `security-secrets-push`, `security-iac-pipeline`).

## 2. UI & Design Standards
- **No Raw Emojis in UI:** Do NOT use raw Unicode emojis (such as ⚠️, 🛑, 🔍, 📦) as icons in the UI. Always use clean, accessible vector/SVG icons with proper contrast and harmonious color palettes.
- **Severity Color Coding:**
  - `Critical` (`#ef4444` / Red): Critical defects, errors, or emergency alerts.
  - `Warning / Medium` (`#f59e0b` / Amber): Non-critical warnings, maintenance items, or pending status.
  - `Safe` (`#22c55e` / Green): Fully verified, defect-free, and operational.

## 3. Architecture & Knowledge Graph (Token Conservation)
- **Primary Knowledge Source:** Before exploring random directories, always inspect `graphify-out/GRAPH_REPORT.md` (or `graphify-out/graph.json`) first to identify God Nodes, services, and bridges.
- **Impact Analysis:** Before core service refactorings, check inbound connections in `graphify-out/graph.json` to identify affected consumers without scanning the full repository.
- **Workflow:** Look up connections in `GRAPH_REPORT.md` -> target only the relevant 1–3 files -> execute changes.
- **Continuous Graph Update:** Synchronize the graph via `python scripts/update-graphify.py` when adding new modules or services.

## 4. Multi-Agent Bridge & Tandem Workflow (Roo Code & Antigravity)
- **Central Protocol Files:**
  - Global Bridge: `C:\Users\marcu\.gemini\config\agent-bridge.md`
  - Workspace Bridge: `AGENT_SYNC.md` (Root directory)
- **Role Assignment:**
  - **Antigravity Agent:** Lead Architect, Core Logic & Signals, Unit Tests (`.spec.ts`), Code Reviews, Socratic Quizzes.
  - **Roo Code:** Executor, File Operations, Terminal Runner (`npm test`, linting), SCSS Decompositions, Git Tasks.
- **Lifecycle & Execution Protocol:**
  1. **Task Initialization:** Inspect the bridge file before starting work to verify phase, objectives, and constraints.
  2. **Status Update:** Set the active worker state to `IN_PROGRESS`.
  3. **Handoff & Completion:**
     - After code creation (Antigravity): Document requirements in Section 1 of `AGENT_SYNC.md`, check box 1.
     - After execution/tests (Roo Code): Log terminal outputs in Section 2, check box 2.
     - After review/quiz (Antigravity): Finalize Section 3, check box 3, and launch the knowledge check.

## 5. Script & Scratch Hygiene (.js / .mjs / .py)
- **One-off Scripts Cleanup:** Delete temporary migration, repair, and batch scripts in `scratch/`, `scripts/`, or root immediately after execution.
- **Permanent Tooling Only:** Retain only permanent maintenance and generation scripts in `scripts/` (`update-graphify.py`, report generators).
- **Workspace Cleanliness:** Do not leave transient `.mjs` or scratch helper files behind once a task is complete.

## 6. Workflow Trigger: "Für heute Feierabend" (End of Day Workflow)

When the user types **"Für heute Feierabend"** into the chat, automatically execute the following steps:

1. **Aggregate Context:**
   - Summarize all features, refactorings, and bug fixes implemented today.
   - Aggregate key learnings (Signals, Clean Code, TypeScript typing).
   - If needed, run E2E/UX audits and save the report to `docs/audits/e2e_and_ux_audit_report.md`.

2. **Synchronize Files – Target Folder: `docs/learning-journal/`:**
   - **`learning_journal.js`:** Update the data array with date, tasks, learnings, and open todos.
   - **`learning_journal.html`:** Rebuild via `node scripts/build-learning-journal-html.js`.
   - **`learning_journal.pdf`:** Trigger PDF build or ensure print-ready layout (`@media print` CSS).

3. **Reset Bridge & Sync Files (Workspace & Global):**
   - Do NOT delete file structures. Reset `AGENT_SYNC.md` and `agent-bridge.md` back to their base templates:
     - Reset task status checkboxes to `[ ]`.
     - Set active roles and phase to `IDLE`.
     - Clear task descriptions and logs to clean placeholder comments.

4. **Git Commit & Push to GitHub:**
   - Execute the following terminal commands:
     ```bash
     git add .
     git commit -m "chore: end of day sync and learning journal [skip ci]"
     git push
     ```

5. **Output Status Summary:**
   - Output a 3-point summary of the day's progress.
   - Confirm updates for the journal, bridge template resets, and successful Git push.

## 7. Workflow Trigger: "Starte Audit" (Standalone E2E & UX Audit)
When the command **"Starte Audit"** is triggered:
1. Load the `webapp-testing` skill for Playwright tests and capture viewports.
2. Load the `ux-audit` skill to evaluate against Nielsen's 10 Usability Heuristics.
3. Save the report to `docs/audits/e2e_and_ux_audit_report.md`.

## 8. Workflow Trigger: "Starte Code Quiz"
- When **"Starte Code Quiz"** is triggered, load `daily-code-quiz.md`.
- Run 3 to 4 rounds sequentially in strict Sparring Partner mode.
- Save the documentation to `docs/quizzes/` as Markdown and trigger the PDF build.

## 9. Workflow Trigger: "Erklär mir das ins Tagebuch"

When the command **"Erklär mir das ins Tagebuch"** is triggered:

### 1. Plain-Language Explanation in Chat
Explain the function thoroughly using a balanced mix of real-world analogy and clear step-by-step technical breakdown:
- **Real-World Purpose:** Plain-language analogy and purpose.
- **Step-by-Step Flow:** Complete input-to-output flow, signals, and side effects.
- **Aha Moment & Pitfall:** Key edge case, reactivity detail, or common trap.

### 2. Store in Functions Learning Journal
Append the explanation and code snippet to:
`docs/learning-journal/functions_learning.js`

- **`functions_learning.js`:** Append entry to data array:
  ```javascript
  const functionsLearningJournal = [
    {
      timestamp: "YYYY-MM-DD HH:mm",
      functionName: "exampleFunction",
      filePath: "src/app/features/...",
      codeSnippet: "...",
      realWorldPurpose: "...",
      stepByStepFlow: ["Step 1...", "Step 2..."],
      ahaMoment: "..."
    }
  ];
  ```

## 10. Workflow Trigger: "Starte Army-of-Juniors Audit"

When the command **"Starte Army-of-Juniors Audit"** is triggered:

### 1. Execute 10-Dimension Audit
Load the `army-of-juniors-audit` skill to audit all source files (`src/`, Services, Components, State Management, APIs, Tests) against the 10 OX Security Anti-Patterns:
1. **Comments Everywhere** (Überkommentierung)
2. **Avoidance of Refactors & Technical Debt**
3. **Over-Specification & Missing Abstraction** (Dispose-After-Use)
4. **Return of the Monoliths** (Vermischte Zuständigkeiten)
5. **The Lie of Unit Test Coverage** (Test-Qualität statt Quantität)
6. **Phantom Bugs & Bloat**
7. **Vanilla Style vs. Battle-Tested SDKs**
8. **Bugs Déjà-Vu & Code Duplication**
9. **Environment & Deployment Parity**
10. **Security: "Insecure by Dumbness"** (Kritischer Fokus)

### 2. Output & Documentation
- Save the structured audit report to:
  `docs/audits/army_of_juniors_audit_report.md`
- Output the executive summary, criticality scores, detailed findings with line numbers, and immediate remediation blocks in the chat.

## 11. Workflow Trigger: "Starte Security Audit"

When the command **"Starte Security Audit"** is triggered:

### 1. Execute 4-Pillar DevSecOps Audit
Sequentially invoke and evaluate the codebase against the 4 modular security skills:
1. `security-sast-audit`: Scan for injection flaws, unescaped DOM/SQL patterns, taint flows, and missing input validation.
2. `security-supply-chain`: Inspect npm dependencies, lockfiles, known advisories, and lifecycle script risks.
3. `security-secrets-push`: Audit git staged/changed files and config templates for high-entropy tokens or exposed API keys.
4. `security-iac-pipeline`: Review Dockerfiles, GitHub Actions workflows, non-root users, permissions, and commit-SHA pinning.

### 2. Output & Documentation
- Save the structured audit report to:
  `docs/audits/devsecops_security_audit_report.md`
- Output the executive summary, critical findings, and remediation code blocks directly in the chat.
