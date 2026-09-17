import { test, expect } from '@playwright/test';

test('Conta Teste', async ({ page }) => {
  await page.goto('https://edulibre.local/');
  await page.getByRole('navigation').getByRole('link', { name: 'Login' }).click();
  await page.getByRole('link', { name: 'Crie a sua gratuitamente' }).click();
  await page.getByRole('textbox', { name: 'Nome' }).click();
  await page.getByRole('textbox', { name: 'Nome' }).fill('Teste');
  await page.getByRole('textbox', { name: 'E-mail' }).click();
  await page.getByRole('textbox', { name: 'E-mail' }).fill('teste@email.local');
  await page.getByRole('textbox', { name: 'CPF' }).click();
  await page.getByRole('textbox', { name: 'CPF' }).fill('13113113112');
  await page.getByRole('textbox', { name: 'Data de nascimento' }).fill('1999-11-11');
  await page.getByRole('textbox', { name: 'Senha', exact: true }).click();
  await page.getByRole('textbox', { name: 'Senha', exact: true }).fill('!Teste123456');
  await page.getByRole('textbox', { name: 'Confirmar senha' }).click();
  await page.getByRole('textbox', { name: 'Confirmar senha' }).fill('!Teste123456');
  await page.getByRole('button', { name: 'Criar conta' }).click();
});