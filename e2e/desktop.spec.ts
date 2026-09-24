import type { Locator, Page } from '@playwright/test';
import { test, expect } from './fixtures';

/** Opens a game from its desktop card and returns its window frame. */
async function openGame(page: Page, title: string): Promise<Locator> {
  const card = page.locator('div').filter({ has: page.getByText(title, { exact: true }) }).filter({
    has: page.getByRole('button', { name: 'Play Now' }),
  });
  await card.last().getByRole('button', { name: 'Play Now' }).click();
  // Minimize button -> button row -> title bar -> window frame.
  const win = page.getByTitle('Minimize').last().locator('xpath=ancestor::div[3]');
  await expect(win).toBeVisible();
  return win;
}

async function box(locator: Locator) {
  const b = await locator.boundingBox();
  if (!b) throw new Error('element has no bounding box');
  return b;
}

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('button', { name: 'Play Now' })).toHaveCount(5);
});

test('game window drags, resizes, minimizes and restores with progress intact', async ({ page }) => {
  const win = await openGame(page, 'Interactive Fiction');
  const titleBar = win.getByText('Interactive Fiction', { exact: true });

  // The store clamps windows to the viewport, so keep moves well inside it.
  // Drag the title bar.
  const start = await box(win);
  const tb = await box(titleBar);
  await page.mouse.move(tb.x + 5, tb.y + 5);
  await page.mouse.down();
  await page.mouse.move(tb.x + 65, tb.y + 45, { steps: 8 });
  await page.mouse.up();
  const moved = await box(win);
  expect(moved.x).toBeCloseTo(start.x + 60, 0);
  expect(moved.y).toBeCloseTo(start.y + 40, 0);
  expect(moved.width).toBeCloseTo(start.width, 0);

  // Resize from the bottom-right handle.
  const hx = moved.x + moved.width - 6;
  const hy = moved.y + moved.height - 6;
  await page.mouse.move(hx, hy);
  await page.mouse.down();
  await page.mouse.move(hx + 80, hy + 50, { steps: 8 });
  await page.mouse.up();
  const resized = await box(win);
  expect(resized.x).toBeCloseTo(moved.x, 0);
  expect(resized.width).toBeCloseTo(moved.width + 80, 0);
  expect(resized.height).toBeCloseTo(moved.height + 50, 0);

  // Make progress in the story.
  await win.getByRole('button', { name: 'Inspect the cracked gate' }).click();
  const gateText = 'Behind a loose brick you find a Rusty Key.';
  await expect(win.getByText(gateText, { exact: false })).toBeVisible();

  // Minimize to the taskbar...
  await win.getByTitle('Minimize').click();
  await expect(win).toBeHidden();
  const taskbarItem = page.getByRole('button', { name: 'Interactive Fiction', exact: true });
  await expect(taskbarItem).toBeVisible();

  // ...and restore: same place, same size, same scene.
  await taskbarItem.click();
  await expect(win).toBeVisible();
  await expect(taskbarItem).toBeHidden();
  await expect(win.getByText(gateText, { exact: false })).toBeVisible();
  const restored = await box(win);
  expect(restored).toEqual(resized);
});

test('switching theme shows the restart notice in an open game', async ({ page }) => {
  const win = await openGame(page, 'Interactive Fiction');
  // Let the lazily loaded game mount in the starting theme first.
  await expect(win.getByRole('button', { name: 'Inspect the cracked gate' })).toBeVisible();
  await expect(win.getByText('Theme changed — restarting')).toHaveCount(0);

  const themeSelect = page.getByRole('combobox');
  await expect(themeSelect).toHaveValue('retro');
  await themeSelect.selectOption('futuristic');

  await expect(page.locator('html')).toHaveAttribute('data-theme', 'futuristic');
  await expect(win.getByText('Theme changed — restarting')).toBeVisible();
});

test('volume button toggles between VOL and MUTE', async ({ page }) => {
  const volume = page.getByRole('button', { name: 'Volume' });
  await expect(volume).toHaveText('VOL');
  await expect(volume).toHaveAttribute('aria-pressed', 'false');

  await volume.click();
  await expect(volume).toHaveText('MUTE');
  await expect(volume).toHaveAttribute('aria-pressed', 'true');

  await volume.click();
  await expect(volume).toHaveText('VOL');
  await expect(volume).toHaveAttribute('aria-pressed', 'false');
});
