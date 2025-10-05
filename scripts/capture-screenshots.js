// Simple screenshot generator using Playwright. Requires dev server running.
// Usage: APP_URL=http://localhost:5173 node scripts/capture-screenshots.js

const path = require('path');
const fs = require('fs');
const { chromium, devices } = require('playwright');

const BASE_URL = process.env.APP_URL || 'http://localhost:5173';
const OUT_DIR = path.resolve(__dirname, '..', 'promo');

async function ensureDir(p) {
  await fs.promises.mkdir(path.dirname(p), { recursive: true });
}

async function getCurrentScheme(page) {
  return page.evaluate(() => {
    const sources = [document.documentElement, document.body, document.getElementById('root')];
    for (const el of sources) {
      if (el && el.getAttribute && el.getAttribute('data-mantine-color-scheme')) {
        return el.getAttribute('data-mantine-color-scheme');
      }
    }
    try {
      return localStorage.getItem('mantine-color-scheme') || 'light';
    } catch (e) {
      return 'light';
    }
  });
}

async function clickThemeToggle(page, { isMobile } = { isMobile: false }) {
  // Try direct toggle first
  const toggle = page.locator('[aria-label="Toggle color scheme"]');
  if (await toggle.first().isVisible({ timeout: 500 }).catch(() => false)) {
    await toggle.first().click();
    return true;
  }
  // On mobile pages, toggle is inside the menu — open it first
  if (isMobile) {
    const openMenu = page.locator('[aria-label="Open menu"]');
    if (await openMenu.first().isVisible({ timeout: 500 }).catch(() => false)) {
      await openMenu.first().click();
      const modalToggle = page.locator('[aria-label="Toggle color scheme"]');
      if (await modalToggle.first().isVisible({ timeout: 1000 }).catch(() => false)) {
        await modalToggle.first().click();
        // close menu if it's still open by pressing Escape (optional)
        await page.keyboard.press('Escape').catch(() => {});
        return true;
      }
    }
  }
  return false;
}

async function ensureTheme(page, desired, { isMobile } = { isMobile: false }) {
  let current = await getCurrentScheme(page);
  if (current === desired) return true;
  const clicked = await clickThemeToggle(page, { isMobile });
  if (!clicked) {
    // Fallback: toggle on home then return
    const prev = page.url();
    await page.goto(new URL('/home', BASE_URL).toString(), { waitUntil: 'networkidle' });
    await clickThemeToggle(page, { isMobile });
    await page.goto(prev, { waitUntil: 'networkidle' });
  }
  await page.waitForTimeout(300);
  current = await getCurrentScheme(page);
  return current === desired;
}

async function shoot(page, urlPath, fileName, extraWaitMs = 1000, fullPage = true) {
  const url = new URL(urlPath, BASE_URL).toString();
  await page.goto(url, { waitUntil: 'networkidle' });
  // Give UI a moment to settle
  await page.waitForTimeout(extraWaitMs);
  const outPath = path.join(OUT_DIR, fileName);
  await ensureDir(outPath);
  await page.screenshot({ path: outPath, fullPage });
  return outPath;
}

async function run() {
  const browser = await chromium.launch();

  // Note on device frames: Playwright does not provide device chrome/frames in screenshots.
  // We emulate device viewport and user agent. Frames can be added later via image compositing if desired.

  const pages = [
    { path: '/home', base: 'Home' },
    { path: '/songs/index', base: 'Song List' },
    { path: '/song/1', base: 'Song Display' },
  ];

  // Helper to capture a set (desktop or mobile) for both light/dark
  async function captureSet({ labelPrefix, contextOptions, filePrefix, isMobile = false }) {
    for (const theme of ['Light', 'Dark']) {
      const scheme = theme.toLowerCase();
      const ctx = await browser.newContext({ ...contextOptions });
      const page = await ctx.newPage();
      for (const p of pages) {
        const needsExtra = p.path.startsWith('/songs') || p.path.startsWith('/song');
        const wait = needsExtra ? 2000 : 1000;
        const fileName = `${filePrefix} - ${p.base} (${theme}).png`;
        const fullPage = isMobile ? false : true; // mobile should fit device height, not full page
        // Ensure theme before capturing
        await page.goto(new URL(p.path, BASE_URL).toString(), { waitUntil: 'networkidle' });
        await ensureTheme(page, scheme, { isMobile });
        const saved = await shoot(page, p.path, fileName, wait, fullPage);
        console.log('Saved', saved);
      }
      await ctx.close();
    }
  }

  // Desktop: standard viewport
  await captureSet({
    labelPrefix: 'Desktop',
    contextOptions: { viewport: { width: 1366, height: 900 }, deviceScaleFactor: 1 },
    filePrefix: 'Desktop',
    isMobile: false,
  });

  // Mobile: emulate iPhone 12 (modern device)
  const iPhone12 = devices['iPhone 12'];
  await captureSet({
    labelPrefix: 'iPhone 12',
    contextOptions: { ...iPhone12 },
    filePrefix: 'iPhone 12',
    isMobile: true,
  });

  await browser.close();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
