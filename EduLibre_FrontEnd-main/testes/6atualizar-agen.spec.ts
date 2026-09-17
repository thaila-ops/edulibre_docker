import { test, expect } from '@playwright/test';

test('Atualizar Agendamento', async ({ page }) => {
  await page.goto('https://edulibre.local/');
  await page.getByRole('navigation').getByRole('link', { name: 'Login' }).click();
  await page.getByRole('textbox', { name: 'E-mail' }).fill('teste@email.local');
  await page.getByRole('textbox', { name: 'Senha' }).fill('!Teste123456');
  await page.getByRole('button', { name: 'Entrar' }).click();

  await expect(page.getByRole('navigation').getByRole('link', { name: 'Minha conta' })).toBeVisible({ timeout: 20000 });

  await page.getByRole('main').getByRole('link', { name: 'Agendamentos recebidos' }).click();
  await page.waitForLoadState('networkidle');

  const linhaAgendamento = page.getByRole('row').filter({ hasText: 'Aguardando' }).first();
  await expect(linhaAgendamento).toBeVisible({ timeout: 10000 });

  await linhaAgendamento.getByRole('combobox').selectOption('Recusar');
  await linhaAgendamento.getByRole('button', { name: 'Salvar' }).click();
  await page.waitForLoadState('networkidle');

  await expect(page.getByRole('navigation').getByRole('link', { name: 'Minha conta' })).toBeVisible();
});