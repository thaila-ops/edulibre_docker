import { test, expect } from '@playwright/test';

test('Deletar Aula', async ({ page }) => {
  await page.goto('https://edulibre.local/');
  await page.getByRole('navigation').getByRole('link', { name: 'Login' }).click();
  await page.getByRole('textbox', { name: 'E-mail' }).fill('teste@email.local');
  await page.getByRole('textbox', { name: 'Senha' }).fill('!Teste123456');
  await page.getByRole('button', { name: 'Entrar' }).click();

  await expect(page.getByRole('navigation').getByRole('link', { name: 'Minha conta' })).toBeVisible({ timeout: 20000 });

  await page.getByRole('link', { name: 'Abrir Minhas aulas' }).click();
  await page.waitForLoadState('networkidle');

  const primeiraLinhaAula = page.getByRole('row').filter({ hasText: 'Excluir' }).first();
  await expect(primeiraLinhaAula).toBeVisible({ timeout: 10000 });

  await primeiraLinhaAula.getByRole('button', { name: 'Excluir' }).click();
  await page.waitForLoadState('networkidle');
  await expect(primeiraLinhaAula.getByRole('button', { name: 'Excluir' })).not.toBeVisible({ timeout: 10000 });
});