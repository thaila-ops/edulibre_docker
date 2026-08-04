import { test, expect } from '@playwright/test';

test('Criar Aula', async ({ page }) => {
  await page.goto('https://edulibre.local/');
  await page.getByRole('navigation').getByRole('link', { name: 'Login' }).click();
  await page.getByRole('textbox', { name: 'E-mail' }).fill('teste@email.local');
  await page.getByRole('textbox', { name: 'Senha' }).fill('!Teste123456');
  await page.getByRole('button', { name: 'Entrar' }).click();

  await expect(page.getByRole('navigation').getByRole('link', { name: 'Minha conta' })).toBeVisible({ timeout: 20000 });

  await page.getByRole('main').getByRole('link', { name: 'Publicar aula' }).click();
  await page.getByRole('textbox', { name: 'Matéria' }).fill('materia teste');
  await page.getByRole('spinbutton', { name: 'Valor' }).fill('199');
  await page.getByRole('textbox', { name: 'Descrição' }).fill('teste desc');
  await page.getByRole('button', { name: 'Salvar' }).click();
  await page.waitForLoadState('networkidle');
});