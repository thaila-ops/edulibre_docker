import { test, expect, Page } from '@playwright/test';

async function fazerLogin(page: Page) {
  await page.goto('/login');
  await page.getByLabel(/e-mail/i).fill('maiara.123@teste.com');
  await page.getByLabel(/senha/i).fill('Mr#123456');
  await page.getByRole('button', { name: /entrar/i }).click();
  await page.waitForURL(/\/conta/);
}

test.describe('CRUD de Aulas', () => {
  test.beforeEach(async ({ page }) => {
    await fazerLogin(page);
  });

  test('listar: exibe página de minhas aulas', async ({ page }) => {
    await page.goto('/minhas-aulas');
    await expect(page.getByRole('heading', { name: /minhas aulas/i })).toBeVisible();
  });

  test('cadastrar: cria nova aula com sucesso', async ({ page }) => {
    await page.goto('/criar-aula');
    await page.getByLabel(/título/i).fill('Aula de Matemática E2E');
    await page.getByLabel(/descrição/i).fill('Descrição de teste automático');
    await page.getByLabel(/preço/i).fill('50');
    await page.getByRole('button', { name: /salvar|criar|publicar/i }).click();
    await expect(page).toHaveURL(/\/minhas-aulas/);
    await expect(page.getByText('Aula de Matemática E2E')).toBeVisible();
  });

  test('editar: altera dados de uma aula existente', async ({ page }) => {
    await page.goto('/minhas-aulas');
    await page.getByRole('link', { name: /editar/i }).first().click();
    await page.getByLabel(/título/i).fill('Aula Editada E2E');
    await page.getByRole('button', { name: /salvar|atualizar/i }).click();
    await expect(page).toHaveURL(/\/minhas-aulas/);
    await expect(page.getByText('Aula Editada E2E')).toBeVisible();
  });

  test('excluir: remove uma aula da lista', async ({ page }) => {
    await page.goto('/minhas-aulas');
    const linhas = page.getByRole('row');
    const totalAntes = await linhas.count();
    await page.getByRole('button', { name: /excluir|remover/i }).first().click();
    await expect(linhas).toHaveCount(totalAntes - 1);
  });

  test('falha: campo título obrigatório ao cadastrar', async ({ page }) => {
    await page.goto('/criar-aula');
    await page.getByRole('button', { name: /salvar|criar|publicar/i }).click();
    await expect(page.getByLabel(/título/i)).toBeFocused();
  });
});