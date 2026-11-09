import { Browser, Page, chromium, test } from '@playwright/test';
import { playAudit } from 'playwright-lighthouse';

const DEBUGGING_PORT = 9222;
const TARGET_URL = process.env['LIGHTHOUSE_TARGET_URL'] ?? 'http://localhost:4200';

const LIGHTHOUSE_THRESHOLDS = {
  performance: 90,
  accessibility: 100,
  'best-practices': 95,
  seo: 100,
} as const;

async function launchDebuggingBrowser(): Promise<Browser> {
  return chromium.launch({
    args: [`--remote-debugging-port=${DEBUGGING_PORT}`],
    headless: true,
  });
}

async function runLighthouseAudit(targetPage: Page): Promise<void> {
  await playAudit({
    page: targetPage,
    port: DEBUGGING_PORT,
    thresholds: LIGHTHOUSE_THRESHOLDS,
    reports: {
      formats: { json: true, html: true },
      name: 'lighthouse-audit-report',
      directory: 'docs/audits/lighthouse',
    },
  });
}

test.describe('Automated Lighthouse Performance & Accessibility Audit', () => {
  test('meets strict performance, accessibility, best-practices, and SEO thresholds', async () => {
    test.setTimeout(180000);
    const browserInstance: Browser = await launchDebuggingBrowser();
    const targetPage: Page = await browserInstance.newPage();
    try {
      await targetPage.goto(TARGET_URL, { waitUntil: 'networkidle' });
      await runLighthouseAudit(targetPage);
    } finally {
      await browserInstance.close();
    }
  });
});

