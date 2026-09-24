import { test as base, expect } from '@playwright/test';

/** Google Fonts can be unreachable (offline, proxies); those failures are noise. */
const IGNORED = /fonts\.(googleapis|gstatic)\.com/;

/**
 * `test` that fails on any console error or uncaught page error,
 * except failed Google Fonts requests.
 */
export const test = base.extend<{ pageErrors: void }>({
  pageErrors: [
    async ({ page }, use) => {
      const errors: string[] = [];
      page.on('console', (msg) => {
        if (msg.type() !== 'error') return;
        if (IGNORED.test(msg.location().url) || IGNORED.test(msg.text())) return;
        errors.push(`console.error: ${msg.text()}`);
      });
      page.on('pageerror', (err) => errors.push(`pageerror: ${err.message}`));
      await use();
      expect(errors, 'unexpected browser errors').toEqual([]);
    },
    { auto: true },
  ],
});

export { expect };
