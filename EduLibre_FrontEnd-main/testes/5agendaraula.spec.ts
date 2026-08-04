import { test, expect } from '@playwright/test';

test('Agendar Aula', async ({ page }) => {
  await page.goto('https://edulibre.local/');
  await page.getByRole('navigation').getByRole('link', { name: 'Login' }).click();
  await page.getByRole('textbox', { name: 'E-mail' }).fill('teste2@email.local');
  await page.getByRole('textbox', { name: 'Senha' }).fill('!Teste123456');
  await page.getByRole('button', { name: 'Entrar' }).click();

  await expect(page.getByRole('navigation').getByRole('link', { name: 'Minha conta' })).toBeVisible({ timeout: 20000 });

  await page.getByRole('link', { name: 'Agendar aula' }).click();
  await expect(page.getByText('Testemateria testeteste').first()).toBeVisible({ timeout: 10000 });
  await expect(page.getByRole('link', { name: 'Agendar aula' }).first()).toBeVisible({ timeout: 10000 });
  await page.getByRole('link', { name: 'Agendar aula' }).first().click();
  await page.getByRole('textbox', { name: 'Data e hora' }).fill('2026-11-11T12:00');
  await page.getByRole('button', { name: 'Confirmar agendamento' }).click();
  await expect(page.getByRole('cell', { name: 'Pendente' }).first()).toBeVisible({ timeout: 10000 });
});