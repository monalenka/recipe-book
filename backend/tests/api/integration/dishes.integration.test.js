const axios = require('axios');
const FormData = require('form-data');
const { BASE_URL } = require('./setup');

async function createProductMultipart(fields) {
    const form = new FormData();
    for (const [key, value] of Object.entries(fields)) {
        form.append(key, String(value));
    }
    try {
        const res = await axios.post(`${BASE_URL}/products`, form, { headers: form.getHeaders() });
        return { status: 201, body: res.data };
    } catch (err) {
        return { status: err.response?.status || 500, body: err.response?.data || {} };
    }
}

async function createDishMultipart(fields) {
    const form = new FormData();
    for (const [key, value] of Object.entries(fields)) {
        if (key === 'products' || key === 'flags') {
            form.append(key, JSON.stringify(value));
        } else {
            form.append(key, String(value));
        }
    }
    try {
        const res = await axios.post(`${BASE_URL}/dishes`, form, { headers: form.getHeaders() });
        return { status: 201, body: res.data };
    } catch (err) {
        return { status: err.response?.status || 500, body: err.response?.data || {} };
    }
}

describe('Dishes API - интеграционные тесты', () => {
    let testProductId;

    beforeAll(async () => {
        const res = await createProductMultipart({
            name: 'База продукт',
            calories: 200,
            proteins: 10,
            fats: 5,
            carbohydrates: 30,
            category: 'Овощи',
            preparation_status: 'Готовый к употреблению',
            flags: JSON.stringify(['Веган', 'Без глютена']),
        });
        testProductId = res.body.id;
    });

    describe('Макросы в названии и категория', () => {
        test('макрос !десерт -> категория Десерт, макрос удаляется из имени', async () => {
            const res = await createDishMultipart({
                name: 'Тирамису !десерт',
                serving_size: 150,
                products: [{ product_id: testProductId, quantity: 100 }],
            });
            expect(res.status).toBe(201);
            expect(res.body.name).toBe('Тирамису');
            expect(res.body.category).toBe('Десерт');
        });

        test('категория из запроса переопределяет макрос', async () => {
            const res = await createDishMultipart({
                name: 'Суп !первое',
                serving_size: 200,
                category: 'Второе',
                products: [{ product_id: testProductId, quantity: 100 }],
            });
            expect(res.status).toBe(201);
            expect(res.body.name).toBe('Суп');
            expect(res.body.category).toBe('Второе');
        });
    });

    describe('Флаги блюда', () => {
        let veganProductId, nonVeganProductId;

        beforeAll(async () => {
            const vRes = await createProductMultipart({
                name: 'Веган продукт',
                calories: 100,
                proteins: 5,
                fats: 2,
                carbohydrates: 10,
                category: 'Овощи',
                preparation_status: 'Готовый к употреблению',
                flags: JSON.stringify(['Веган', 'Без глютена']),
            });
            veganProductId = vRes.body.id;

            const nvRes = await createProductMultipart({
                name: 'Не веган',
                calories: 150,
                proteins: 20,
                fats: 15,
                carbohydrates: 5,
                category: 'Мясной',
                preparation_status: 'Требует приготовления',
                flags: JSON.stringify([]),
            });
            nonVeganProductId = nvRes.body.id;
        });

        test('флаги блюда сохраняются, если все ингредиенты поддерживают', async () => {
            const res = await createDishMultipart({
                name: 'Веганское блюдо',
                serving_size: 200,
                category: 'Салат',
                flags: ['Веган', 'Без глютена'],
                products: [{ product_id: veganProductId, quantity: 100 }],
            });
            expect(res.status).toBe(201);
            expect(res.body.flags).toEqual(expect.arrayContaining(['Веган', 'Без глютена']));
        });

        test('флаги блюда выдают ошибку, если ингредиенты их не поддерживают', async () => {
            const res = await createDishMultipart({
                name: 'Псевдовеган',
                serving_size: 200,
                category: 'Второе',
                flags: ['Веган'],
                products: [{ product_id: nonVeganProductId, quantity: 100 }],
            });
            expect(res.status).toBe(400);
            expect(res.body.error).toMatch(/Flag.*not available/i);
        });
    });

    describe('Автоматический расчёт нутриентов и ручная корректировка', () => {
        test('автоматический расчёт при создании', async () => {
            const res = await createDishMultipart({
                name: 'Расчётное блюдо',
                serving_size: 150,
                category: 'Второе',
                products: [{ product_id: testProductId, quantity: 150 }],
            });
            expect(res.status).toBe(201);
            expect(res.body.calories).toBeCloseTo(300, 1);
            expect(res.body.proteins).toBeCloseTo(15, 1);
            expect(res.body.fats).toBeCloseTo(7.5, 1);
            expect(res.body.carbohydrates).toBeCloseTo(45, 1);
        });

        test('ручные значения нутриентов сохраняются (переопределяют расчёт)', async () => {
            const res = await createDishMultipart({
                name: 'Ручное блюдо',
                serving_size: 150,
                category: 'Второе',
                calories: 400,
                proteins: 40,
                fats: 30,
                carbohydrates: 30,
                products: [{ product_id: testProductId, quantity: 150 }],
            });
            expect(res.status).toBe(201);
            expect(res.body.calories).toBe(400);
            expect(res.body.proteins).toBe(40);
            expect(res.body.fats).toBe(30);
            expect(res.body.carbohydrates).toBe(30);
        });
    });

    describe('GET /api/dishes - фильтрация, поиск, сортировка', () => {
        beforeAll(async () => {
            await axios.delete(`${BASE_URL}/test/reset`);

            const productRes = await createProductMultipart({
                name: 'База продукт для GET',
                calories: 200,
                proteins: 10,
                fats: 5,
                carbohydrates: 30,
                category: 'Овощи',
                preparation_status: 'Готовый к употреблению',
                flags: JSON.stringify(['Веган', 'Без глютена']),
            });
            testProductId = productRes.body.id;

            await createDishMultipart({
                name: 'Салат Оливье',
                serving_size: 200,
                category: 'Салат',
                products: [{ product_id: testProductId, quantity: 100 }],
            });
            await createDishMultipart({
                name: 'Суп Харчо',
                serving_size: 300,
                category: 'Суп',
                flags: ['Без глютена'],
                products: [{ product_id: testProductId, quantity: 100 }],
            });
        });

        test('фильтр по категории', async () => {
            const res = await axios.get(`${BASE_URL}/dishes`, { params: { category: 'Салат' } });
            expect(res.status).toBe(200);
            expect(res.data.length).toBe(1);
            expect(res.data[0].name).toBe('Салат Оливье');
        });

        test('поиск по подстроке (регистронезависимый)', async () => {
            const res = await axios.get(`${BASE_URL}/dishes`, { params: { search: 'хар' } });
            expect(res.status).toBe(200);
            expect(res.data.length).toBe(1);
            expect(res.data[0].name).toBe('Суп Харчо');
        });

        test('комбинированные фильтры (категория + флаги)', async () => {
            const res = await axios.get(`${BASE_URL}/dishes`, {
                params: { category: 'Суп', flags: 'Без глютена' },
            });
            expect(res.status).toBe(200);
            expect(res.data.length).toBe(1);
            expect(res.data[0].name).toBe('Суп Харчо');
        });

        test('сортировка по имени без учёта регистра', async () => {
            await createDishMultipart({
                name: 'aaa',
                serving_size: 100,
                category: 'Перекус',
                products: [{ product_id: testProductId, quantity: 10 }],
            });
            await createDishMultipart({
                name: 'BBB',
                serving_size: 100,
                category: 'Перекус',
                products: [{ product_id: testProductId, quantity: 10 }],
            });
            const res = await axios.get(`${BASE_URL}/dishes`, {
                params: { sortBy: 'name', sortOrder: 'ASC' },
            });
            const names = res.data.map(d => d.name);
            expect(names).toEqual(['aaa', 'BBB', 'Салат Оливье', 'Суп Харчо']);
        });
    });

    describe('POST /api/dishes/calculate', () => {
        test('граничные значения количества ингредиентов: 0 невалидно, 0.01 валидно', async () => {
            const zeroRes = await createDishMultipart({
                name: 'Блюдо с 0г',
                serving_size: 100,
                category: 'Второе',
                products: [{ product_id: testProductId, quantity: 0 }],
            });
            expect(zeroRes.status).toBe(400);
            expect(zeroRes.body.error).toMatch(/Количество продукта должно быть больше 0/);

            const minRes = await createDishMultipart({
                name: 'Блюдо с 0.01г',
                serving_size: 100,
                category: 'Второе',
                products: [{ product_id: testProductId, quantity: 0.01 }],
            });
            expect(minRes.status).toBe(201);
            expect(minRes.body.calories).toBeCloseTo(200 * 0.01 / 100, 1);
        });

        test('если продукта не существует в БД -> ошибка', async () => {
            const res = await createDishMultipart({
                name: 'Несуществующий продукт',
                serving_size: 100,
                category: 'Второе',
                products: [{ product_id: 999999, quantity: 100 }],
            });
            expect(res.status).toBe(404);
            expect(res.body.error).toMatch(/not found/);
        });
    });

    describe('Создание блюда с пустым составом', () => {
        test('пустой список ингредиентов -> ошибка', async () => {
            const res = await createDishMultipart({
                name: 'Пустое блюдо',
                serving_size: 100,
                category: 'Десерт',
                products: [],
            });
            expect(res.status).toBe(400);
            expect(res.body.error).toMatch(/состав не может быть пустым/i);
        });
    });
});