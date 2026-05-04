import { test, expect } from '@playwright/test';
import { DishCreatePage } from './pages/dishCreatePage';

test.describe('Dish creation via UI', () => {
  test.beforeEach(async ({ page }) => {
    await page.route(/\/api\/products(?:\?.*)?$/, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          { id: 1, name: 'Курица', calories: 200, proteins: 25, fats: 10, carbohydrates: 0 },
          { id: 2, name: 'Рис', calories: 330, proteins: 7, fats: 1, carbohydrates: 74 },
        ]),
      });
    });

    await page.route(/\/api\/dishes(?:\?.*)?$/, async (route) => {
      const request = route.request();
      if (request.method() === 'POST') {
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({ id: 77, name: 'Тестовое блюдо' }),
        });
        return;
      }

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([]),
      });
    });
  });

  test('creates dish for valid equivalence class', async ({ page }) => {
    const form = new DishCreatePage(page);
    await form.open();
    await form.fillBaseFields({
      name: 'Курица с рисом',
      servingSize: 250,
      category: 'Второе',
    });
    await form.fillProductRow(0, { productId: 1, quantity: 150 });

    await form.submit();

    await expect(page.getByRole('heading', { name: 'Блюда' })).toBeVisible();
    await expect(page.getByText('Блюдо создано')).toBeVisible();
  });

  test.describe('serving size boundary values', () => {
    const servingCases = [
      {
        title: 'rejects value below minimum boundary',
        servingSize: 0,
        expectsError: true,
      },
      {
        title: 'accepts lower practical UI boundary (step=0.1)',
        servingSize: 0.1,
        expectsError: false,
      },
    ];

    for (const caseData of servingCases) {
      test(caseData.title, async ({ page }) => {
        const form = new DishCreatePage(page);
        await form.open();
        await form.fillBaseFields({
          name: 'Тест блюда',
          servingSize: caseData.servingSize,
          category: 'Суп',
        });
        await form.fillProductRow(0, { productId: 2, quantity: 50 });
        await form.submit();

        if (caseData.expectsError) {
          await expect(form.formError).toContainText('Должно быть больше 0');
          await expect(page.getByRole('heading', { name: 'Создать блюдо' })).toBeVisible();
        } else {
          await expect(page.getByRole('heading', { name: 'Блюда' })).toBeVisible();
        }
      });
    }
  });

  test('shows validation error for invalid product equivalence class', async ({ page }) => {
    const form = new DishCreatePage(page);
    await form.open();
    await form.fillBaseFields({
      name: 'Некорректное блюдо',
      servingSize: 100,
      category: 'Перекус',
    });

    await form.submit();

    await expect(form.formError).toContainText('Пожалуйста, заполните все продукты корректно');
    await expect(page.getByRole('heading', { name: 'Создать блюдо' })).toBeVisible();
  });

  test('auto-calculates nutrition after selecting product and quantity', async ({ page }) => {
    const form = new DishCreatePage(page);
    await form.open();

    await form.fillProductRow(0, { productId: 1, quantity: 100 });
    await page.getByRole('button', { name: 'Рассчитать автоматически' }).click();

    await expect(form.caloriesInput).toHaveValue('200');
    await expect(form.proteinsInput).toHaveValue('25');
    await expect(form.fatsInput).toHaveValue('10');
    await expect(form.carbohydratesInput).toHaveValue('0');
  });

  test.describe('name macros in dish title', () => {
    const macroCases = [
      {
        title: 'rejects too short title after macro removal',
        name: '!суп а',
        expectsError: true,
      },
      {
        title: 'accepts valid title after macro removal',
        name: '!суп аб',
        expectsError: false,
      },
    ];

    for (const caseData of macroCases) {
      test(caseData.title, async ({ page }) => {
        const form = new DishCreatePage(page);
        await form.open();
        await form.fillBaseFields({
          name: caseData.name,
          servingSize: 100,
          category: '',
        });
        await form.fillProductRow(0, { productId: 2, quantity: 50 });
        await form.submit();

        if (caseData.expectsError) {
          await expect(form.formError).toContainText('Название после удаления макроса должно содержать минимум 2 символа');
          await expect(page.getByRole('heading', { name: 'Создать блюдо' })).toBeVisible();
        } else {
          await expect(page.getByRole('heading', { name: 'Блюда' })).toBeVisible();
          await expect(page.getByText('Блюдо создано')).toBeVisible();
        }
      });
    }
  });
});
