import { test, expect } from '@playwright/test';

test('VerificarStatusAula', async ({ page }) => {
  await page.goto('https://edulibre.local/');
  await page.getByRole('navigation').getByRole('link', { name: 'Login' }).click();
  await page.getByRole('textbox', { name: 'E-mail' }).fill('teste2@email.local');
  await page.getByRole('textbox', { name: 'Senha' }).fill('!Teste123456');
  await page.getByRole('button', { name: 'Entrar' }).click();

  await expect(page.getByRole('navigation').getByRole('link', { name: 'Minha conta' })).toBeVisible({ timeout: 20000 });

  await page.getByRole('navigation').getByRole('link', { name: 'Agendamentos', exact: true }).click();
  await expect(page.getByText('Negado')).toBeVisible({ timeout: 10000 });
});