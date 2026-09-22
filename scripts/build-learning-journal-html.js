const fs = require('fs');
const path = require('path');

const journalJsPath = path.join(__dirname, '..', 'docs', 'learning-journal', 'learning_journal.js');
const functionsJsPath = path.join(__dirname, '..', 'docs', 'learning-journal', 'functions_learning.js');
const targetHtmlPath = path.join(__dirname, '..', 'docs', 'learning-journal', 'learning_journal.html');

let journalEntries = [];
try {
  const content = fs.readFileSync(journalJsPath, 'utf8');
  // Simple extraction of journal array
  const sandbox = {};
  const fn = new Function('module', 'exports', content + '\nreturn learningJournalData;');
  journalEntries = fn({}, {});
} catch (e) {
  console.warn('Could not parse learning_journal.js:', e.message);
}

let functionEntries = [];
try {
  if (fs.existsSync(functionsJsPath)) {
    const fnContent = fs.readFileSync(functionsJsPath, 'utf8');
    const fnEvaluator = new Function(fnContent + '\nreturn functionsLearningJournal;');
    functionEntries = fnEvaluator();
  }
} catch (e) {
  console.warn('Could not parse functions_learning.js:', e.message);
}

const htmlContent = `<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>RiesaRiesenImbiss - Learning Journal</title>
  <style>
    :root {
      --bg: #0a0b10;
      --card-bg: rgba(22, 27, 34, 0.85);
      --border: rgba(255, 140, 0, 0.3);
      --accent: #ff8c00;
      --cyan: #00f3ff;
      --green: #22c55e;
      --text: #e6edf3;
      --text-muted: #8b949e;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: var(--bg);
      color: var(--text);
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      padding: 2rem;
      line-height: 1.6;
    }
    .header {
      text-align: center;
      margin-bottom: 2.5rem;
      padding-bottom: 1.5rem;
      border-bottom: 1px solid var(--border);
    }
    .header h1 {
      font-size: 2.4rem;
      letter-spacing: 2px;
      color: var(--accent);
      text-transform: uppercase;
      margin-bottom: 0.5rem;
    }
    .header p {
      color: var(--text-muted);
      font-size: 1rem;
    }
    .journal-entry {
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 2rem;
      margin-bottom: 2rem;
      box-shadow: 0 10px 30px rgba(0,0,0,0.5);
    }
    .entry-date {
      display: inline-block;
      background: rgba(255, 140, 0, 0.15);
      color: var(--accent);
      padding: 0.3rem 0.8rem;
      border-radius: 20px;
      font-size: 0.85rem;
      font-weight: 700;
      margin-bottom: 1rem;
    }
    .entry-title {
      font-size: 1.6rem;
      color: #fff;
      margin-bottom: 1.5rem;
    }
    .section-title {
      font-size: 1.1rem;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: var(--cyan);
      margin: 1.5rem 0 0.8rem 0;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .task-list, .learning-list, .todo-list {
      list-style: none;
    }
    .task-list li, .learning-list li, .todo-list li {
      position: relative;
      padding-left: 1.5rem;
      margin-bottom: 0.6rem;
      font-size: 0.95rem;
    }
    .task-list li::before { content: '✓'; position: absolute; left: 0; color: var(--green); font-weight: bold; }
    .learning-list li::before { content: '💡'; position: absolute; left: 0; font-size: 0.9rem; }
    .todo-list li::before { content: '⏳'; position: absolute; left: 0; }

    .function-card {
      background: rgba(0, 243, 255, 0.04);
      border: 1px solid rgba(0, 243, 255, 0.2);
      border-radius: 8px;
      padding: 1.2rem;
      margin-top: 1rem;
    }
    .function-name {
      color: var(--cyan);
      font-family: monospace;
      font-size: 1.2rem;
      font-weight: bold;
    }
    pre {
      background: #0d1117;
      padding: 1rem;
      border-radius: 6px;
      overflow-x: auto;
      font-family: Consolas, monospace;
      font-size: 0.85rem;
      color: #79c0ff;
      margin: 0.8rem 0;
      border: 1px solid rgba(255,255,255,0.08);
    }
    .analogy {
      background: rgba(255, 140, 0, 0.08);
      border-left: 3px solid var(--accent);
      padding: 0.8rem 1rem;
      margin: 0.8rem 0;
      font-style: italic;
    }
    @media print {
      body { background: white; color: black; padding: 1rem; }
      .journal-entry { border: 1px solid #ccc; box-shadow: none; page-break-inside: avoid; background: white; }
      .entry-title, .header h1 { color: #d97706; }
      pre { background: #f3f4f6; color: #1f2937; border: 1px solid #e5e7eb; }
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>RiesaRiesenImbiss</h1>
    <p>Projekt-Lerntagebuch & Feierabend-Synchronisation</p>
  </div>

  ${journalEntries.map(entry => `
    <div class="journal-entry">
      <span class="entry-date">${entry.date}</span>
      <h2 class="entry-title">${entry.title}</h2>

      <h3 class="section-title">Umgesetzte Aufgaben & Refactorings</h3>
      <ul class="task-list">
        ${entry.tasks.map(task => `<li>${task}</li>`).join('')}
      </ul>

      <h3 class="section-title">Zentrale Learnings & Architektur-Erkenntnisse</h3>
      <ul class="learning-list">
        ${entry.learnings.map(learning => `<li>${learning}</li>`).join('')}
      </ul>

      ${entry.openTodos && entry.openTodos.length > 0 ? `
        <h3 class="section-title">Offene Punkte für die nächste Session</h3>
        <ul class="todo-list">
          ${entry.openTodos.map(todo => `<li>${todo}</li>`).join('')}
        </ul>
      ` : ''}
    </div>
  `).join('')}

  ${functionEntries.length > 0 ? `
    <div class="journal-entry">
      <h2 class="entry-title">Funktionen-Deep-Dives</h2>
      ${functionEntries.map(fn => `
        <div class="function-card">
          <div class="function-name">${fn.functionName} (${fn.filePath})</div>
          <div class="analogy">${fn.realWorldPurpose}</div>
          <pre><code>${fn.codeSnippet}</code></pre>
          <ul class="task-list">
            ${fn.stepByStepFlow.map(step => `<li>${step}</li>`).join('')}
          </ul>
          <div style="margin-top: 0.8rem; font-size: 0.9rem; color: var(--accent);">
            <strong>Aha-Moment:</strong> ${fn.ahaMoment}
          </div>
        </div>
      `).join('')}
    </div>
  ` : ''}
</body>
</html>
`;

fs.writeFileSync(targetHtmlPath, htmlContent, 'utf8');
console.log('Successfully built learning_journal.html');
