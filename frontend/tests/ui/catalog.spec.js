import { test, expect } from '@playwright/test';
import { DishesCatalogPage, ProductsCatalogPage } from './pages/catalogPages';

test.describe('Catalog pages and cards via UI', () => {
  test('products page: search/filter/flags update request and cards', async ({ page }) => {
    const requestLog = [];

    await page.route(/\/api\/products(?:\/\d+)?(?:\?.*)?$/, async (route) => {
      const request = route.request();
      const url = new URL(request.url());
      requestLog.push({
        search: url.searchParams.get('search') || '',
        category: url.searchParams.get('category') || '',
        flags: url.searchParams.get('flags') || '',
      });

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            id: 11,
            name: 'Тофу',
            calories: 76,
            proteins: 8,
            fats: 4.8,
            carbohydrates: 1.9,
            category: 'Мясной',
            flags: ['Веган'],
            images: [],
          },
        ]),
      });
    });

    const catalog = new ProductsCatalogPage(page);
    await catalog.open();
    await catalog.search('тоф');
    await catalog.setCategory('Мясной');
    await catalog.flags.vegan.check();

    await expect(page.getByRole('heading', { name: 'Тофу' })).toBeVisible();
    await expect(page.getByText('Флаги: Веган')).toBeVisible();
    await expect.poll(() => requestLog.some((r) => r.search === 'тоф')).toBeTruthy();
    await expect.poll(() => requestLog.some((r) => r.category === 'Мясной')).toBeTruthy();
    await expect.poll(() => requestLog.some((r) => r.flags.includes('Веган'))).toBeTruthy();
  });

  test('dishes page: search and flags are available and applied', async ({ page }) => {
    const requestLog = [];

    await page.route(/\/api\/dishes(?:\?.*)?$/, async (route) => {
      const url = new URL(route.request().url());
      requestLog.push({
        search: url.searchParams.get('search') || '',
        category: url.searchParams.get('category') || '',
        flags: url.searchParams.get('flags') || '',
      });
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            id: 19,
            name: 'Веганский суп',
            calories: 180,
            proteins: 7,
            fats: 3,
            carbohydrates: 28,
            serving_size: 300,
            category: 'Суп',
            flags: ['Веган', 'Без глютена'],
            images: [],
          },
        ]),
      });
    });

    const catalog = new DishesCatalogPage(page);
    await catalog.open();
    await catalog.searchInput.fill('суп');
    await catalog.searchButton.click();
    await catalog.flags.vegan.check();

    await expect(page.getByRole('heading', { name: 'Веганский суп' })).toBeVisible();
    await expect(page.getByText('Флаги: Веган, Без глютена')).toBeVisible();
    await expect.poll(() => requestLog.some((r) => r.search === 'суп')).toBeTruthy();
    await expect.poll(() => requestLog.some((r) => r.flags.includes('Веган'))).toBeTruthy();
  });

  test('cannot delete product used in dish', async ({ page }) => {
    await page.route('**/api/products/*', async (route) => {
      await route.fulfill({
        status: 409,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Нельзя удалить продукт, который используется в блюде' }),
      });
    });

    await page.route(/\/api\/products(?:\?.*)?$/, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            id: 50,
            name: 'Курица',
            calories: 200,
            proteins: 20,
            fats: 10,
            carbohydrates: 0,
            category: 'Мясной',
            flags: [],
            images: [],
          },
        ]),
      });
    });

    const catalog = new ProductsCatalogPage(page);
    await catalog.open();
    await page.getByRole('button', { name: 'Удалить' }).click();

    await expect(page.getByText('Нельзя удалить продукт, который используется в блюде')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Курица' })).toBeVisible();
  });
});
