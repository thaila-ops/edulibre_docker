import { test, expect } from '@playwright/test';

test('Verificar Site Online', async ({ page }) => {
  await page.goto('https://edulibre.local/');
});