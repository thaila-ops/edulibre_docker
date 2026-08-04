import { test, expect } from '@playwright/test';

test('Registrar Usuário Aleatório', async ({ page }) => {
  const emailDeTeste = `usuario${Date.now()}@edulibre.local`;
  const senhaDeTeste = 'SenhaForte123!';
  const cpfDeTeste = Math.floor(10000000000 + Math.random() * 90000000000).toString();

  await page.goto('https://edulibre.local/');
  await page.getByRole('navigation').getByRole('link', { name: 'Login' }).click();
  await page.getByText('Crie a sua gratuitamente').click();

  await page.getByRole('textbox', { name: 'Nome' }).fill('Usuário de Teste');
  await page.getByRole('textbox', { name: 'E-mail' }).fill(emailDeTeste);
  await page.getByRole('textbox', { name: 'CPF' }).fill(cpfDeTeste);
  await page.getByRole('textbox', { name: 'Data de nascimento' }).fill('1990-01-01');
  await page.getByRole('textbox', { name: 'Senha', exact: true }).fill(senhaDeTeste);
  await page.getByRole('textbox', { name: 'Confirmar senha' }).fill(senhaDeTeste);
  await page.getByRole('button', { name: 'Criar conta' }).click();

  await expect(page.getByRole('button', { name: 'Entrar' })).toBeVisible({ timeout: 20000 });

  await page.getByRole('textbox', { name: 'E-mail' }).fill(emailDeTeste);
  await page.getByRole('textbox', { name: 'Senha' }).fill(senhaDeTeste);
  await page.getByRole('button', { name: 'Entrar' }).click();

  await expect(page.getByRole('navigation').getByRole('link', { name: 'Minha conta' })).toBeVisible({ timeout: 20000 });
});