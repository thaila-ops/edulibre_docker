import { test, expect } from '@playwright/test';

test.describe('Cadastro de Usuário', () => {
  test('sucesso: cria conta com dados válidos', async ({ page }) => {
    const email = `teste_${Date.now()}@example.com`;
    await page.goto('/cadastro');
    await page.getByLabel(/nome/i).fill('Usuario Teste');
    await page.getByLabel(/e-mail/i).fill(email);
    await page.getByLabel(/cpf/i).fill('12345678901');
    await page.getByLabel(/nascimento/i).fill('1990-01-01');
    await page.getByLabel(/^senha$/i).fill('Senha@123');
    await page.getByLabel(/confirmar senha/i).fill('Senha@123');
    await page.getByRole('button', { name: /cadastrar/i }).click();
    await expect(page).toHaveURL(/\/(login|conta)/);
  });

  test('falha: exibe erro quando senhas não conferem', async ({ page }) => {
    await page.goto('/cadastro');
    await page.getByLabel(/nome/i).fill('Usuario Teste');
    await page.getByLabel(/e-mail/i).fill('teste@example.com');
    await page.getByLabel(/cpf/i).fill('12345678901');
    await page.getByLabel(/nascimento/i).fill('1990-01-01');
    await page.getByLabel(/^senha$/i).fill('Senha@123');
    await page.getByLabel(/confirmar senha/i).fill('SenhaDiferente@1');
    await page.getByRole('button', { name: /cadastrar/i }).click();
    await expect(page.getByText(/confirmação de senha/i)).toBeVisible();
  });

  test('falha: exibe erro com e-mail inválido', async ({ page }) => {
    await page.goto('/cadastro');
    await page.getByLabel(/e-mail/i).fill('emailruim');
    await page.getByRole('button', { name: /cadastrar/i }).click();
    await expect(page.getByText(/e-mail válido/i)).toBeVisible();
  });
});