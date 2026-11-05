import { expect, test } from '@playwright/test';

test('has expected page title and brand', async ({ page }) => {
	await page.goto('/');
	await expect(page).toHaveTitle(/Bacheemos Paraguay/i);
	await expect(page.locator('.brand-title')).toBeVisible();
});
