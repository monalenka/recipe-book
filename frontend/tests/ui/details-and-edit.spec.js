import { expect, test } from '@playwright/test';

test.describe('Details, edit and delete via cards', () => {
  test('sorts products by supported fields via filter panel', async ({ page }) => {
    const sortRequests = [];

    await page.route(/\/api\/products(?:\?.*)?$/, async (route) => {
      const url = new URL(route.request().url());
      sortRequests.push({
        sortBy: url.searchParams.get('sortBy'),
        sortOrder: url.searchParams.get('sortOrder'),
      });
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            id: 1,
            name: 'Альфа',
            calories: 10,
            proteins: 1,
            fats: 2,
            carbohydrates: 3,
            category: 'Овощи',
            flags: [],
            images: [],
          },
        ]),
      });
    });

    await page.goto('/products');
    await expect(page.getByRole('heading', { name: 'Продукты' })).toBeVisible();

    const sortSelect = page.locator('select').nth(2);
    await sortSelect.selectOption('name-asc');
    await sortSelect.selectOption('calories-desc');
    await sortSelect.selectOption('proteins-asc');
    await sortSelect.selectOption('fats-desc');
    await sortSelect.selectOption('carbohydrates-asc');

    await expect.poll(() => sortRequests.some((r) => r.sortBy === 'name' && r.sortOrder === 'asc')).toBeTruthy();
    await expect.poll(() => sortRequests.some((r) => r.sortBy === 'calories' && r.sortOrder === 'desc')).toBeTruthy();
    await expect.poll(() => sortRequests.some((r) => r.sortBy === 'proteins' && r.sortOrder === 'asc')).toBeTruthy();
    await expect.poll(() => sortRequests.some((r) => r.sortBy === 'fats' && r.sortOrder === 'desc')).toBeTruthy();
    await expect.poll(() => sortRequests.some((r) => r.sortBy === 'carbohydrates' && r.sortOrder === 'asc')).toBeTruthy();
  });

  test('opens product details from card and renders key fields', async ({ page }) => {
    await page.route(/\/api\/products(?:\?.*)?$/, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            id: 10,
            name: 'Томат',
            calories: 18,
            proteins: 1,
            fats: 0.2,
            carbohydrates: 3.9,
            ingredients: 'Свежий томат',
            category: 'Овощи',
            preparation_status: 'Готовый к употреблению',
            flags: ['Веган'],
            images: [],
          },
        ]),
      });
    });

    await page.route('**/api/products/10', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 10,
          name: 'Томат',
          calories: 18,
          proteins: 1,
          fats: 0.2,
          carbohydrates: 3.9,
          ingredients: 'Свежий томат',
          category: 'Овощи',
          preparation_status: 'Готовый к употреблению',
          flags: ['Веган'],
          images: [],
          created_at: '2026-01-01T10:00:00.000Z',
          updated_at: '2026-01-02T10:00:00.000Z',
        }),
      });
    });

    await page.goto('/products');
    await page.getByRole('link', { name: 'Подробнее' }).click();

    await expect(page.getByRole('heading', { name: 'Томат' })).toBeVisible();
    await expect(page.getByText('Свежий томат')).toBeVisible();
    await expect(page.getByText('Веган')).toBeVisible();
  });

  test('edits product from card and shows updated card value', async ({ page }) => {
    let updatedName = 'Кефир';

    await page.route(/\/api\/products(?:\?.*)?$/, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            id: 21,
            name: updatedName,
            calories: 50,
            proteins: 3,
            fats: 2,
            carbohydrates: 4,
            ingredients: 'Молочный продукт',
            category: 'Жидкость',
            preparation_status: 'Готовый к употреблению',
            flags: [],
            images: [],
          },
        ]),
      });
    });

    await page.route('**/api/products/21', async (route) => {
      const method = route.request().method();
      if (method === 'PUT') {
        updatedName = 'Кефир 1%';
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ id: 21, name: updatedName }),
        });
        return;
      }

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 21,
          name: updatedName,
          calories: 50,
          proteins: 3,
          fats: 2,
          carbohydrates: 4,
          ingredients: 'Молочный продукт',
          category: 'Жидкость',
          preparation_status: 'Готовый к употреблению',
          flags: [],
          images: [],
        }),
      });
    });

    await page.goto('/products');
    await page.getByRole('link', { name: 'Редактировать' }).click();
    await expect(page.getByRole('heading', { name: 'Редактировать продукт' })).toBeVisible();

    await page.locator('input[name="name"]').fill('Кефир 1%');
    await page.getByRole('button', { name: 'Сохранить' }).click();

    await expect(page.getByRole('heading', { name: 'Продукты' })).toBeVisible();
    await expect(page.getByText('Продукт обновлён')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Кефир 1%' })).toBeVisible();
  });

  test('opens dish details and contains products list with quantity', async ({ page }) => {
    await page.route(/\/api\/dishes(?:\?.*)?$/, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            id: 31,
            name: 'Салат',
            calories: 180,
            proteins: 7,
            fats: 3,
            carbohydrates: 28,
            serving_size: 250,
            category: 'Салат',
            flags: ['Веган'],
            images: [],
          },
        ]),
      });
    });

    await page.route('**/api/dishes/31', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 31,
          name: 'Салат',
          calories: 180,
          proteins: 7,
          fats: 3,
          carbohydrates: 28,
          serving_size: 250,
          category: 'Салат',
          flags: ['Веган'],
          images: [],
          products: [{ id: 12, name: 'Томат', DishProduct: { quantity: 100 } }],
          created_at: '2026-01-01T10:00:00.000Z',
          updated_at: '2026-01-02T10:00:00.000Z',
        }),
      });
    });

    await page.goto('/dishes');
    await page.getByRole('link', { name: 'Подробнее' }).click();

    await expect(page.getByRole('heading', { name: 'Салат' })).toBeVisible();
    await expect(page.getByText('Размер порции:')).toBeVisible();
    await expect(page.getByText('Томат - 100 г')).toBeVisible();
  });

  test('deletes dish from details page and returns to list', async ({ page }) => {
    await page.route(/\/api\/dishes(?:\?.*)?$/, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([]),
      });
    });

    await page.route('**/api/dishes/44', async (route) => {
      const method = route.request().method();
      if (method === 'DELETE') {
        await route.fulfill({ status: 204, body: '' });
        return;
      }

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 44,
          name: 'Рисовая тарелка',
          calories: 210,
          proteins: 8,
          fats: 1,
          carbohydrates: 43,
          serving_size: 220,
          category: 'Второе',
          flags: [],
          images: [],
          products: [],
          created_at: '2026-01-01T10:00:00.000Z',
          updated_at: '2026-01-02T10:00:00.000Z',
        }),
      });
    });

    page.on('dialog', (dialog) => dialog.accept());

    await page.goto('/dishes/44');
    await expect(page.getByRole('heading', { name: 'Рисовая тарелка' })).toBeVisible();
    await page.getByRole('button', { name: 'Удалить' }).click();

    await expect(page.getByRole('heading', { name: 'Блюда' })).toBeVisible();
    await expect(page.getByText('Блюдо удалено')).toBeVisible();
  });
});
