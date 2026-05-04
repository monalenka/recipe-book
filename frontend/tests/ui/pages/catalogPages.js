import { expect } from '@playwright/test';

export class ProductsCatalogPage {
  constructor(page) {
    this.page = page;
    this.searchInput = page.getByPlaceholder('Поиск...');
    this.searchButton = page.getByRole('button', { name: 'Найти' });
    this.clearButton = page.getByRole('button', { name: 'Сбросить' });
    this.categorySelect = page.locator('select').first();
    this.flags = {
      vegan: page.getByLabel('Веган'),
      glutenFree: page.getByLabel('Без глютена'),
      sugarFree: page.getByLabel('Без сахара'),
    };
  }

  async open() {
    await this.page.goto('/products');
    await expect(this.page.getByRole('heading', { name: 'Продукты' })).toBeVisible();
  }

  async search(term) {
    await this.searchInput.fill(term);
    await this.searchButton.click();
  }

  async setCategory(category) {
    await this.categorySelect.selectOption(category);
  }
}

export class DishesCatalogPage {
  constructor(page) {
    this.page = page;
    this.searchInput = page.getByPlaceholder('Поиск...');
    this.searchButton = page.getByRole('button', { name: 'Найти' });
    this.categorySelect = page.locator('select').first();
    this.flags = {
      vegan: page.getByLabel('Веган'),
      glutenFree: page.getByLabel('Без глютена'),
      sugarFree: page.getByLabel('Без сахара'),
    };
  }

  async open() {
    await this.page.goto('/dishes');
    await expect(this.page.getByRole('heading', { name: 'Блюда' })).toBeVisible();
  }
}
