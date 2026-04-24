const { calculateDishNutrition } = require('../../src/utils/calculations');

describe("calculateDishNutrition", () => {
    const validProduct = {
        product_id: 1,
        quantity: 200,
        product: { calories: 100, proteins: 20, fats: 5, carbohydrates: 10 }
    };

    describe("Эквивалентное разбиение", () => {
        test("пустой массив продуктов возвращает нули", () => {
            const result = calculateDishNutrition([]);
            expect(result).toEqual({
                totalCalories: 0,
                totalProteins: 0,
                totalFats: 0,
                totalCarbohydrates: 0,
                totalWeight: 0
            });
        });

        test("продукт с положительными значениями", () => {
            const products = [{ quantity: 200, product: { calories: 100, proteins: 20, fats: 5, carbohydrates: 10 } }];
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

        test("продукты с нулевыми значениями БЖУ", () => {
            const products = [
                { quantity: 100, product: { calories: 0, proteins: 0, fats: 0, carbohydrates: 0 } },
                { quantity: 200, product: { calories: 0, proteins: 0, fats: 0, carbohydrates: 0 } }
            ];
            const result = calculateDishNutrition(products);
            expect(result.totalCalories).toBe(0);
            expect(result.totalProteins).toBe(0);
            expect(result.totalFats).toBe(0);
            expect(result.totalCarbohydrates).toBe(0);
            expect(result.totalWeight).toBe(300);
        });
    });

    describe("Анализ граничных значений", () => {
        test("количество продукта = 0 (нижняя граница)", () => {
            const products = [{ quantity: 0, product: { calories: 100, proteins: 20, fats: 5, carbohydrates: 10 } }];
            const result = calculateDishNutrition(products);
            expect(result.totalCalories).toBe(0);
            expect(result.totalWeight).toBe(0);
        });

        test("количество продукта очень большое", () => {
            const products = [{ quantity: 1000000, product: { calories: 100, proteins: 20, fats: 5, carbohydrates: 10 } }];
            const result = calculateDishNutrition(products);
            expect(result.totalCalories).toBeCloseTo(1000000, 1);
            expect(result.totalWeight).toBe(1000000);
        });

        test("количество продукта – дробное (0.5 грамма)", () => {
            const products = [{ quantity: 0.5, product: { calories: 100, proteins: 20, fats: 5, carbohydrates: 10 } }];
            const result = calculateDishNutrition(products);
            expect(result.totalCalories).toBeCloseTo(0.5, 1);
            expect(result.totalWeight).toBe(0.5);
        });
    });

    describe("Обработка невалидных данных (ошибки)", () => {
        test("null вместо массива выбрасывает ошибку", () => {
            expect(() => calculateDishNutrition(null)).toThrow('productsData is required');
        });

        test("undefined вместо массива выбрасывает ошибку", () => {
            expect(() => calculateDishNutrition(undefined)).toThrow('productsData is required');
        });

        test("не массив (число) выбрасывает ошибку", () => {
            expect(() => calculateDishNutrition(123)).toThrow('productsData must be an array');
        });

        test("отрицательное quantity выбрасывает ошибку", () => {
            const invalid = [{ quantity: -10, product: { calories: 100 } }];
            expect(() => calculateDishNutrition(invalid)).toThrow('Product quantity cannot be negative');
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