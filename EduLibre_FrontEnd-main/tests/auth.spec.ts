import { test, expect } from '@playwright/test';

test.describe('Login', () => {
  test('sucesso: redireciona para /conta com credenciais válidas', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel(/e-mail/i).fill('maiara.123@teste.com');
    await page.getByLabel(/senha/i).fill('Mr#123456');
    await page.getByRole('button', { name: /entrar/i }).click();
    await expect(page).toHaveURL(/\/conta/);
  });

  test('falha: exibe erro com credenciais inválidas', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel(/e-mail/i).fill('naoexiste@teste.com');
    await page.getByLabel(/senha/i).fill('SenhaErrada@1');
    await page.getByRole('button', { name: /entrar/i }).click();
    await expect(page.locator('.feedback, [role="alert"], .error')).toBeVisible();
  });

  test('falha: exibe erro com e-mail inválido', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel(/e-mail/i).fill('emailinvalido');
    await page.getByLabel(/senha/i).fill('Mr#123456');
    await page.getByRole('button', { name: /entrar/i }).click();
    await expect(page.getByText(/e-mail válido/i)).toBeVisible();
  });
});