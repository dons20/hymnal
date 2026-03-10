// Simple screenshot generator using Playwright. Requires dev server running.
// Usage: APP_URL=http://localhost:5173 node scripts/capture-screenshots.js

const path = require('path');
const fs = require('fs');
const { chromium, devices } = require('playwright');

const BASE_URL = process.env.APP_URL || 'http://localhost:5173';
const OUT_DIR = path.resolve(__dirname, '..', 'promo');

// Standard desktop viewport dimensions
const DESKTOP_VIEWPORT_WIDTH = 1366;
const DESKTOP_VIEWPORT_HEIGHT = 900;

// PWA notification IDs to dismiss before capturing screenshots
const PWA_NOTIFICATION_IDS = ['pwa-install', 'pwa-ios-hint', 'pwa-mobile-hint'];

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

/**
 * Dismiss any visible PWA install or other Mantine notifications so they
 * don't appear in screenshots.
 */
async function dismissNotifications(page) {
  try {
    // Give notifications a moment to appear (PWA install is shown after 2s)
    await page.waitForTimeout(2500);
    // Click all visible notification close buttons
    const closeButtons = page.locator(
      'button[aria-label="Hide notification"], .mantine-Notification-closeButton'
    );
    const count = await closeButtons.count();
    for (let i = 0; i < count; i++) {
      const btn = closeButtons.nth(i);
      if (await btn.isVisible().catch(() => false)) {
        await btn.click().catch(() => {});
      }
    }
    // Also hide by known notification IDs via JS in page context
    await page.evaluate((ids) => {
      try {
        // Access Mantine notifications store if available on window
        const store = window.__mantineNotificationsStore;
        if (store && typeof store.hideNotification === 'function') {
          ids.forEach((id) => store.hideNotification(id));
        }
      } catch (_) {
        // Ignore — notifications may simply not be present
      }
    }, PWA_NOTIFICATION_IDS).catch(() => {});
    // Short pause for dismiss animation to complete
    await page.waitForTimeout(300);
  } catch (_) {
    // Non-fatal — proceed even if dismissal fails
  }
}

async function shoot(page, urlPath, fileName, extraWaitMs = 1000, fullPage = true) {
  const url = new URL(urlPath, BASE_URL).toString();
  await page.goto(url, { waitUntil: 'networkidle' });
  // Give UI a moment to settle
  await page.waitForTimeout(extraWaitMs);
  await dismissNotifications(page);
  const outPath = path.join(OUT_DIR, fileName);
  await ensureDir(outPath);
  await page.screenshot({ path: outPath, fullPage });
  return outPath;
}

/**
 * Open presentation mode for a song, optionally navigate to a specific slide,
 * then take a screenshot. Presentation mode fills the full viewport so
 * fullPageScreenshot defaults to false (viewport-only capture).
 */
async function capturePresentation(page, songPath, fileName, slideIndex = 0, fullPageScreenshot = false) {
  const url = new URL(songPath, BASE_URL).toString();
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);
  await dismissNotifications(page);

  // Click the presentation mode button
  const presentBtn = page.locator('[aria-label="Presentation mode"]');
  await presentBtn.first().click();
  await page.waitForTimeout(600);

  // Navigate to the desired slide by clicking the indicator dots
  if (slideIndex > 0) {
    const dots = page.locator('.presentation-indicator-dot');
    const dotCount = await dots.count();
    if (slideIndex < dotCount) {
      await dots.nth(slideIndex).click();
      await page.waitForTimeout(400);
    }
  }

  const outPath = path.join(OUT_DIR, fileName);
  await ensureDir(outPath);
  await page.screenshot({ path: outPath, fullPage: fullPageScreenshot });
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
    contextOptions: { viewport: { width: DESKTOP_VIEWPORT_WIDTH, height: DESKTOP_VIEWPORT_HEIGHT }, deviceScaleFactor: 1 },
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

  // Presentation mode screenshots — captured on desktop in light mode
  const desktopCtx = await browser.newContext({
    viewport: { width: DESKTOP_VIEWPORT_WIDTH, height: DESKTOP_VIEWPORT_HEIGHT },
    deviceScaleFactor: 1,
  });
  const desktopPage = await desktopCtx.newPage();

  // Song 1 — first slide (Verse 1)
  let saved = await capturePresentation(
    desktopPage,
    '/song/1',
    'Desktop - Presentation Song 1.png',
    0
  );
  console.log('Saved', saved);

  // Song 133 — second slide (Chorus, which shows A and B vocal part tags)
  saved = await capturePresentation(
    desktopPage,
    '/song/133',
    'Desktop - Presentation Song 133 (Chorus).png',
    1
  );
  console.log('Saved', saved);

  await desktopCtx.close();
  await browser.close();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
