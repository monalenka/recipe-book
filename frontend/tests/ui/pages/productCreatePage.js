import { expect } from '@playwright/test';

export class ProductCreatePage {
  constructor(page) {
    this.page = page;
    this.nameInput = page.locator('input[name="name"]');
    this.caloriesInput = page.locator('input[name="calories"]');
    this.proteinsInput = page.locator('input[name="proteins"]');
    this.fatsInput = page.locator('input[name="fats"]');
    this.carbohydratesInput = page.locator('input[name="carbohydrates"]');
    this.categorySelect = page.locator('select[name="category"]');
    this.preparationStatusSelect = page.locator('select[name="preparation_status"]');
    this.ingredientsInput = page.locator('textarea[name="ingredients"]');
    this.submitButton = page.getByRole('button', { name: 'Сохранить' });
    this.bzuError = page.locator('.bzu-error-block');
  }

  async open() {
    await this.page.goto('/products/create');
    await expect(this.page.getByRole('heading', { name: 'Создать продукт' })).toBeVisible();
  }

  async fillRequiredFields(data) {
    await this.nameInput.fill(data.name);
    await this.caloriesInput.fill(String(data.calories));
    await this.proteinsInput.fill(String(data.proteins));
    await this.fatsInput.fill(String(data.fats));
    await this.carbohydratesInput.fill(String(data.carbohydrates));
    await this.categorySelect.selectOption(data.category);
    await this.preparationStatusSelect.selectOption(data.preparationStatus);
  }

  async submit() {
    await this.submitButton.click();
  }
}
