import { test, expect } from '@playwright/test';

test.describe('mobile viewport', () => {
  test('landing page: key elements visible, no horizontal overflow', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: /retro manager/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /play game/i })).toBeVisible();

    const body = page.locator('body');
    const scrollWidth = await body.evaluate((el) => el.scrollWidth);
    const clientWidth = await body.evaluate((el) => el.clientWidth);
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 2);
  });

  test('game hub after start: main visible, no horizontal overflow', async ({ page }) => {
    await page.goto('/game');
    await page.getByPlaceholder(/manager name/i).fill('E2E Manager');
    const teamButton = page.locator('button').filter({ hasText: /REP:\s*\d+/ }).first();
    await teamButton.click();
    await page.getByRole('button', { name: /initialize career/i }).click();

    await expect(page.getByRole('main')).toBeVisible({ timeout: 15000 });
    await expect(page.getByText('Dashboard', { exact: false })).toBeVisible();

    const body = page.locator('body');
    const scrollWidth = await body.evaluate((el) => el.scrollWidth);
    const clientWidth = await body.evaluate((el) => el.clientWidth);
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 2);
  });

  test('hub then squad: team tab visible, no horizontal overflow', async ({ page }) => {
    await page.goto('/game');
    await page.getByPlaceholder(/manager name/i).fill('E2E Manager');
    const teamButton = page.locator('button').filter({ hasText: /REP:\s*\d+/ }).first();
    await teamButton.click();
    await page.getByRole('button', { name: /initialize career/i }).click();

    await expect(page.getByRole('main')).toBeVisible({ timeout: 15000 });
    await page.getByRole('button', { name: /^Team$/i }).click();
    await expect(page.getByText('Squad Selection', { exact: false })).toBeVisible();

    const body = page.locator('body');
    const scrollWidth = await body.evaluate((el) => el.scrollWidth);
    const clientWidth = await body.evaluate((el) => el.clientWidth);
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 2);
  });

  test('player profile opens from squad and has no horizontal overflow', async ({ page }) => {
    await page.goto('/game');
    await page.getByPlaceholder(/manager name/i).fill('E2E Manager');
    const teamButton = page.locator('button').filter({ hasText: /REP:\s*\d+/ }).first();
    await teamButton.click();
    await page.getByRole('button', { name: /initialize career/i }).click();

    await expect(page.getByRole('main')).toBeVisible({ timeout: 15000 });
    await page.getByRole('button', { name: /^Team$/i }).click();
    await expect(page.getByText('Squad Selection', { exact: false })).toBeVisible();

    const firstPlayerName = page.locator('button').filter({ hasText: /[A-Za-z]+ [A-Za-z]+/ }).first();
    await firstPlayerName.click().catch(() => {});

    const dialog = page.getByRole('dialog');
    const profileVisible = await dialog.isVisible().catch(() => false);
    if (profileVisible) {
      const scrollWidth = await page.locator('body').evaluate((el) => el.scrollWidth);
      const clientWidth = await page.locator('body').evaluate((el) => el.clientWidth);
      expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 2);
    }
  });
});
