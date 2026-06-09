import { test, expect, Page } from '@playwright/test';

async function fazerLogin(page: Page) {
  await page.goto('/login');
  await page.getByLabel(/e-mail/i).fill('maiara.123@teste.com');
  await page.getByLabel(/senha/i).fill('Mr#123456');
  await page.getByRole('button', { name: /entrar/i }).click();
  await page.waitForURL(/\/conta/);
}

test.describe('CRUD de Agendamentos', () => {
  test.beforeEach(async ({ page }) => {
    await fazerLogin(page);
  });

  test('listar: exibe página de agendamentos', async ({ page }) => {
    await page.goto('/agendamentos');
    await expect(page.getByRole('heading', { name: /agendamentos/i })).toBeVisible();
  });

  test('cadastrar: cria agendamento com sucesso', async ({ page }) => {
    await page.goto('/professores');
    await page.getByRole('link', { name: /ver detalhes|saiba mais/i }).first().click();
    await page.getByRole('link', { name: /agendar/i }).click();
    await page.getByLabel(/data/i).fill('2026-12-01');
    await page.getByRole('button', { name: /confirmar|agendar/i }).click();
    await expect(page).toHaveURL(/\/agendamentos/);
  });

  test('editar: altera data de um agendamento', async ({ page }) => {
    await page.goto('/agendamentos');
    await page.getByRole('link', { name: /editar/i }).first().click();
    await page.getByLabel(/data/i).fill('2026-12-15');
    await page.getByRole('button', { name: /salvar|atualizar|confirmar/i }).click();
    await expect(page).toHaveURL(/\/agendamentos/);
  });

  test('excluir: cancela um agendamento', async ({ page }) => {
    await page.goto('/agendamentos');
    const linhas = page.getByRole('row');
    const totalAntes = await linhas.count();
    await page.getByRole('button', { name: /cancelar|excluir/i }).first().click();
    await expect(linhas).toHaveCount(totalAntes - 1);
  });

  test('falha: campo data obrigatório ao agendar', async ({ page }) => {
    await page.goto('/professores');
    await page.getByRole('link', { name: /ver detalhes|saiba mais/i }).first().click();
    await page.getByRole('link', { name: /agendar/i }).click();
    await page.getByRole('button', { name: /confirmar|agendar/i }).click();
    await expect(page.getByLabel(/data/i)).toBeFocused();
  });
});