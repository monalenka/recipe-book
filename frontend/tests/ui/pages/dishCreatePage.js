import { expect } from '@playwright/test';

export class DishCreatePage {
  constructor(page) {
    this.page = page;
    this.nameInput = page.locator('input[name="name"]');
    this.servingSizeInput = page.locator('input[name="serving_size"]');
    this.categorySelect = page.locator('select[name="category"]');
    this.submitButton = page.getByRole('button', { name: 'Сохранить' });
    this.formError = page.locator('.server-error');
    this.addProductButton = page.getByRole('button', { name: '+ Добавить продукт' });
    this.productSelects = page.locator('select[name^="products."][name$=".product_id"]');
    this.productQuantities = page.locator('input[name^="products."][name$=".quantity"]');
    this.caloriesInput = page.getByPlaceholder('Калории');
    this.proteinsInput = page.getByPlaceholder('Белки');
    this.fatsInput = page.getByPlaceholder('Жиры');
    this.carbohydratesInput = page.getByPlaceholder('Углеводы');
  }

  async open() {
    await this.page.goto('/dishes/create');
    await expect(this.page.getByRole('heading', { name: 'Создать блюдо' })).toBeVisible();
  }

  async fillBaseFields(data) {
    await this.nameInput.fill(data.name);
    await this.servingSizeInput.fill(String(data.servingSize));
    if (data.category) {
      await this.categorySelect.selectOption(data.category);
    }
  }

  async fillProductRow(index, { productId, quantity }) {
    await this.productSelects.nth(index).selectOption(String(productId));
    await this.productQuantities.nth(index).fill(String(quantity));
  }

  async submit() {
    await this.submitButton.click();
  }
}
