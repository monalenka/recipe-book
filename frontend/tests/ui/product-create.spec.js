import { test, expect } from '@playwright/test';
import { ProductCreatePage } from './pages/productCreatePage';

test.describe('Product creation via UI', () => {
  test.beforeEach(async ({ page }) => {
    await page.route(/\/api\/products(?:\?.*)?$/, async (route) => {
      const request = route.request();
      if (request.method() === 'POST') {
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({ id: 101, name: 'Тестовый продукт' }),
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

  test('creates product for valid equivalence class', async ({ page }) => {
    const form = new ProductCreatePage(page);
    await form.open();
    await form.fillRequiredFields({
      name: 'Гречка',
      calories: 343,
      proteins: 13,
      fats: 3,
      carbohydrates: 71,
      category: 'Крупы',
      preparationStatus: 'Требует приготовления',
    });

    await form.submit();

    await expect(page.getByRole('heading', { name: 'Продукты' })).toBeVisible();
    await expect(page.getByText('Продукт создан')).toBeVisible();
  });

  test.describe('name field boundary values', () => {
    const nameCases = [
      {
        title: 'rejects length below minimum boundary',
        name: 'Я',
        expectsError: true,
      },
      {
        title: 'accepts exact minimum boundary',
        name: 'Яй',
        expectsError: false,
      },
    ];

    for (const caseData of nameCases) {
      test(caseData.title, async ({ page }) => {
        const form = new ProductCreatePage(page);
        await form.open();
        await form.fillRequiredFields({
          name: caseData.name,
          calories: 100,
          proteins: 10,
          fats: 10,
          carbohydrates: 10,
          category: 'Мясной',
          preparationStatus: 'Полуфабрикат',
        });
        await form.submit();

        if (caseData.expectsError) {
          await expect(page.getByText('Минимум 2 символа')).toBeVisible();
          await expect(page.getByRole('heading', { name: 'Создать продукт' })).toBeVisible();
        } else {
          await expect(page.getByRole('heading', { name: 'Продукты' })).toBeVisible();
        }
      });
    }
  });

  test.describe('BJU sum boundary values', () => {
    const bjuCases = [
      {
        title: 'accepts sum exactly 100',
        proteins: 40,
        fats: 30,
        carbohydrates: 30,
        expectsBjuError: false,
      },
      {
        title: 'rejects sum above 100',
        proteins: 40,
        fats: 30,
        carbohydrates: 31,
        expectsBjuError: true,
      },
    ];

    for (const caseData of bjuCases) {
      test(caseData.title, async ({ page }) => {
        const form = new ProductCreatePage(page);
        await form.open();
        await form.fillRequiredFields({
          name: 'Тестовый продукт',
          calories: 100,
          proteins: caseData.proteins,
          fats: caseData.fats,
          carbohydrates: caseData.carbohydrates,
          category: 'Овощи',
          preparationStatus: 'Готовый к употреблению',
        });
        await form.submit();

        if (caseData.expectsBjuError) {
          await expect(form.bzuError).toContainText('Сумма белков, жиров и углеводов не может превышать 100');
          await expect(page.getByRole('heading', { name: 'Создать продукт' })).toBeVisible();
        } else {
          await expect(page.getByRole('heading', { name: 'Продукты' })).toBeVisible();
        }
      });
    }
  });
});
