const { calculateDishNutrition } = require('../../src/utils/calculations');

describe("calculateDishNutrition", () => {
    // ---- ЭКВИВАЛЕНТНОЕ РАЗБИЕНИЕ ----
    describe("Эквивалентное разбиение", () => {
        test("один продукт с положительными значениями", () => {
            const products = [
                { quantity: 200, product: { calories: 100, proteins: 20, fats: 5, carbohydrates: 10 } }
            ];
            const result = calculateDishNutrition(products);
            expect(result.totalCalories).toBeCloseTo(200, 1);
            expect(result.totalProteins).toBeCloseTo(40, 1);
            expect(result.totalFats).toBeCloseTo(10, 1);
            expect(result.totalCarbohydrates).toBeCloseTo(20, 1);
            expect(result.totalWeight).toBe(200);
        });

        test("несколько продуктов с положительными значениями", () => {
            const products = [
                { quantity: 100, product: { calories: 100, proteins: 20, fats: 5, carbohydrates: 10 } },
                { quantity: 150, product: { calories: 50, proteins: 10, fats: 2, carbohydrates: 5 } }
            ];
            const result = calculateDishNutrition(products);
            expect(result.totalCalories).toBeCloseTo(175, 1);
            expect(result.totalProteins).toBeCloseTo(35, 1);
            expect(result.totalFats).toBeCloseTo(8, 1);
            expect(result.totalCarbohydrates).toBeCloseTo(17.5, 1);
            expect(result.totalWeight).toBe(250);
        });

        test("продукт с нулевыми значениями БЖУ", () => {
            const products = [
                { quantity: 100, product: { calories: 0, proteins: 0, fats: 0, carbohydrates: 0 } }
            ];
            const result = calculateDishNutrition(products);
            expect(result.totalCalories).toBe(0);
            expect(result.totalProteins).toBe(0);
            expect(result.totalFats).toBe(0);
            expect(result.totalCarbohydrates).toBe(0);
            expect(result.totalWeight).toBe(100);
        });
    });

    // ---- АНАЛИЗ ГРАНИЧНЫХ ЗНАЧЕНИЙ ----
    describe("Анализ граничных значений", () => {
        test("минимальное количество продукта", () => {
            const products = [
                { quantity: 0.1, product: { calories: 100, proteins: 20, fats: 5, carbohydrates: 10 } }
            ];
            const result = calculateDishNutrition(products);
            expect(result.totalCalories).toBeCloseTo(0.1, 1);
            expect(result.totalWeight).toBeCloseTo(0.1, 1);
        });

        test("количество продукта – дробное", () => {
            const products = [
                { quantity: 0.5, product: { calories: 100, proteins: 20, fats: 5, carbohydrates: 10 } }
            ];
            const result = calculateDishNutrition(products);
            expect(result.totalCalories).toBeCloseTo(0.5, 1);
            expect(result.totalWeight).toBeCloseTo(0.5, 1);
        });

        test("количество продукта очень большое", () => {
            const products = [
                { quantity: 1000000, product: { calories: 100, proteins: 20, fats: 5, carbohydrates: 10 } }
            ];
            const result = calculateDishNutrition(products);
            expect(result.totalCalories).toBeCloseTo(1000000, 1);
            expect(result.totalWeight).toBe(1000000);
        });
    });

    // ---- ОБРАБОТКА НЕВАЛИДНЫХ ДАННЫХ ----
    describe("Обработка невалидных данных", () => {
        test("null вместо массива выбрасывает ошибку", () => {
            expect(() => calculateDishNutrition(null)).toThrow('productsData must be an array');
        });

        test("undefined вместо массива выбрасывает ошибку", () => {
            expect(() => calculateDishNutrition(undefined)).toThrow('productsData must be an array');
        });

        test("не массив (число) выбрасывает ошибку", () => {
            expect(() => calculateDishNutrition(123)).toThrow('productsData must be an array');
        });

        test("пустой массив выбрасывает ошибку", () => {
            expect(() => calculateDishNutrition([])).toThrow('Dish must contain at least one product');
        });

        test("отрицательное quantity выбрасывает ошибку", () => {
            const invalid = [{ quantity: -10, product: { calories: 100 } }];
            expect(() => calculateDishNutrition(invalid)).toThrow('Product quantity must be greater than 0');
        });

        test("quantity = 0 выбрасывает ошибку", () => {
            const invalid = [{ quantity: 0, product: { calories: 100 } }];
            expect(() => calculateDishNutrition(invalid)).toThrow('Product quantity must be greater than 0');
        });

        test("quantity = NaN выбрасывает ошибку", () => {
            const invalid = [{ quantity: NaN, product: { calories: 100 } }];
            expect(() => calculateDishNutrition(invalid)).toThrow('Product quantity must be a number');
        });

        test("отсутствует поле quantity выбрасывает ошибку", () => {
            const invalid = [{ product: { calories: 100 } }];
            expect(() => calculateDishNutrition(invalid)).toThrow('must have "quantity" field');
        });

        test("отсутствует поле product выбрасывает ошибку", () => {
            const invalid = [{ quantity: 100 }];
            expect(() => calculateDishNutrition(invalid)).toThrow('must have "product" object');
        });

        test("product = null выбрасывает ошибку", () => {
            const invalid = [{ quantity: 100, product: null }];
            expect(() => calculateDishNutrition(invalid)).toThrow('must have "product" object');
        });

        test("элемент массива не является объектом выбрасывает ошибку", () => {
            const invalid = ["not an object"];
            expect(() => calculateDishNutrition(invalid)).toThrow('must be an object');
        });
    });
});