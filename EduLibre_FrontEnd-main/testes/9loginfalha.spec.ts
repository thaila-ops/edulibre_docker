import { test, expect } from '@playwright/test';

test('Login inválido', async ({ page }) => {
  await page.goto('https://edulibre.local/login');

  await page.getByRole('textbox', { name: 'E-mail' })
    .fill('naoexiste@email.local');

  // Senha que passa a validação de formato mas é inválida no servidor
  await page.getByRole('textbox', { name: 'Senha' })
    .fill('!Senha123Errada');

  await page.getByRole('button', { name: 'Entrar' }).click();

  // O componente Feedback renderiza um <p class="feedback error"> com a mensagem de erro
  await expect(
    page.locator('.feedback.error')
  ).toBeVisible({ timeout: 8000 });

  // Confirma que o usuário NÃO foi redirecionado (ainda está na página de login)
  await expect(
    page.getByRole('button', { name: 'Entrar' })
  ).toBeVisible();
});