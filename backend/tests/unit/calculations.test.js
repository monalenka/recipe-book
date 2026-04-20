const { calculateDishNutrition } = require('../../src/utils/calculations');

describe("calculateDishNutrition", () => {
    const mockProduct = (calories, proteins, fats, carbs) => ({
        product: { calories, proteins, fats, carbohydrates: carbs }
    });

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

        test("продукт с + значениями", () => {
            const productsData = [
                { product_id: 1, quantity: 200, product: { calories: 100, proteins: 20, fats: 5, carbohydrates: 10 } }
            ];
            const result = calculateDishNutrition(productsData);
            expect(result.totalCalories).toBeCloseTo(200, 1);  // 100 * (200/100) = 200
            expect(result.totalProteins).toBeCloseTo(40, 1);   // 20 * 2 = 40
            expect(result.totalFats).toBeCloseTo(10, 1);       // 5 * 2 = 10
            expect(result.totalCarbohydrates).toBeCloseTo(20, 1); // 10 * 2 = 20
            expect(result.totalWeight).toBe(200);
        });

        test("несколько продуктов с + значениями", () => {
            const productsData = [
                { product_id: 1, quantity: 100, product: { calories: 100, proteins: 20, fats: 5, carbohydrates: 10 } },
                { product_id: 2, quantity: 150, product: { calories: 50, proteins: 10, fats: 2, carbohydrates: 5 } }
            ];
            const result = calculateDishNutrition(productsData);
            // (100*100/100=100, 20*1=20, 5*1=5, 10*1=10) вес=100
            // (50*150/100=75, 10*1.5=15, 2*1.5=3, 5*1.5=7.5) вес=150
            // сумма калории=175, белки=35, жиры=8, углеводы=17.5, вес=250
            expect(result.totalCalories).toBeCloseTo(175, 1);
            expect(result.totalProteins).toBeCloseTo(35, 1);
            expect(result.totalFats).toBeCloseTo(8, 1);
            expect(result.totalCarbohydrates).toBeCloseTo(17.5, 1);
            expect(result.totalWeight).toBe(250);
        });

        test("продукты с нулевыми значениями", () => {
            const productsData = [
                { product_id: 1, quantity: 100, product: { calories: 0, proteins: 0, fats: 0, carbohydrates: 0 } },
                { product_id: 2, quantity: 200, product: { calories: 0, proteins: 0, fats: 0, carbohydrates: 0 } }
            ];
            const result = calculateDishNutrition(productsData);
            expect(result.totalCalories).toBe(0);
            expect(result.totalProteins).toBe(0);
            expect(result.totalFats).toBe(0);
            expect(result.totalCarbohydrates).toBe(0);
            expect(result.totalWeight).toBe(300);
        });
    });

    describe("Анализ граничных значений", () => {
        test("количество продукта = 0", () => {
            const productsData = [
                { product_id: 1, quantity: 0, product: { calories: 100, proteins: 20, fats: 5, carbohydrates: 10 } }
            ];
            const result = calculateDishNutrition(productsData);
            expect(result.totalCalories).toBe(0);
            expect(result.totalProteins).toBe(0);
            expect(result.totalFats).toBe(0);
            expect(result.totalCarbohydrates).toBe(0);
            expect(result.totalWeight).toBe(0);
        });

        test("количество продукта очень большое", () => {
            const productsData = [
                { product_id: 1, quantity: 1000000, product: { calories: 100, proteins: 20, fats: 5, carbohydrates: 10 } }
            ];
            const result = calculateDishNutrition(productsData);
            expect(result.totalCalories).toBeCloseTo(1000000, 1);
            expect(result.totalWeight).toBe(1000000);
        });

        test("количество продукта – дробное (0.5 грамма)", () => {
            const productsData = [
                { product_id: 1, quantity: 0.5, product: { calories: 100, proteins: 20, fats: 5, carbohydrates: 10 } }
            ];
            const result = calculateDishNutrition(productsData);
            expect(result.totalCalories).toBeCloseTo(0.5, 1);
            expect(result.totalWeight).toBe(0.5);
        });
    });
});