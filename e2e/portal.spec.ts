import { test, expect } from './fixtures';

test('portal enters V2 and Escape returns to the V1 desktop', async ({ page }) => {
  await page.goto('/');
  const playNow = page.getByRole('button', { name: 'Play Now' });
  await expect(playNow).toHaveCount(5);

  await page.getByRole('button', { name: 'Enter Gems V2' }).click();

  const v2 = page.getByTestId('v2-root');
  await expect(v2).toBeVisible({ timeout: 15_000 });
  await expect(page).toHaveURL(/#v2$/);
  // Wait for the portal animation to finish before interacting.
  await expect(page.getByTestId('portal-transition')).toHaveCount(0);

  const fallback = page.getByText('3D unavailable');
  const backButton = page.getByRole('button', { name: /Back to V1/ });
  await expect(backButton.first()).toBeVisible();

  if (await fallback.isVisible()) {
    // No WebGL in this browser: V2 must offer its own way home.
    await backButton.click();
  } else {
    await page.keyboard.press('Escape');
  }

  await expect(v2).toHaveCount(0, { timeout: 15_000 });
  await expect(playNow).toHaveCount(5);
  await expect(page).not.toHaveURL(/#v2/);
});
