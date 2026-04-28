const axios = require('axios');
const FormData = require('form-data');
const { BASE_URL } = require('./setup');

async function createProductMultipart(fields, files = []) {
    const form = new FormData();
    for (const [key, value] of Object.entries(fields)) {
        form.append(key, String(value));
    }
    for (let i = 0; i < files.length; i++) {
        form.append('images', Buffer.from('test'), { filename: `test${i}.jpg` });
    }
    try {
        const res = await axios.post(`${BASE_URL}/products`, form, { headers: form.getHeaders() });
        return { status: 201, body: res.data };
    } catch (err) {
        return {
            status: err.response?.status || 500,
            body: err.response?.data || {}
        };
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
        return {
            status: err.response?.status || 500,
            body: err.response?.data || {}
        };
    }
}

describe('Products API - интеграционные тесты', () => {

    describe('Создание продукта', () => {
        describe('валидация длины имени', () => {
            test.each([
                { name: '', expectedStatus: 400, desc: 'пустая строка' },
                { name: 'A', expectedStatus: 400, desc: 'длина 1 (граница)' },
                { name: 'AB', expectedStatus: 201, desc: 'длина 2' },
                { name: 'Нормальное имя', expectedStatus: 201, desc: 'длина >2' },
            ])('$desc', async ({ name, expectedStatus }) => {
                const res = await createProductMultipart({
                    name,
                    calories: 100,
                    proteins: 10,
                    fats: 5,
                    carbohydrates: 30,
                    category: 'Овощи',
                    preparation_status: 'Готовый к употреблению',
                });
                expect(res.status).toBe(expectedStatus);
                if (expectedStatus === 400) {
                    expect(res.body.error).toContain('name');
                }
            });
        });

        describe('ограничение суммы БЖУ', () => {
            test.each([
                { p: 40, f: 30, c: 30, valid: true },
                { p: 40, f: 30, c: 31, valid: false },
                { p: 0, f: 0, c: 100, valid: true },
                { p: 0, f: 0, c: 100.1, valid: false },
            ])('БЖУ $p+$f+$c должен быть валидным: $valid', async ({ p, f, c, valid }) => {
                const res = await createProductMultipart({
                    name: 'БЖУ тест',
                    calories: 200,
                    proteins: p,
                    fats: f,
                    carbohydrates: c,
                    category: 'Овощи',
                    preparation_status: 'Готовый к употреблению',
                });
                if (valid) {
                    expect(res.status).toBe(201);
                } else {
                    expect(res.status).toBe(400);
                    expect(res.body.error).toMatch(/Сумма БЖУ/);
                }
            });
        });

        describe('валидация количества фотографий', () => {
            test('0 фотографий - валидно', async () => {
                const res = await createProductMultipart({
                    name: 'Без фото',
                    calories: 100,
                    proteins: 10,
                    fats: 5,
                    carbohydrates: 30,
                    category: 'Овощи',
                    preparation_status: 'Готовый к употреблению',
                });
                expect(res.status).toBe(201);
            });

            test('5 фотографий - валидно', async () => {
                const res = await createProductMultipart(
                    {
                        name: '5 фото',
                        calories: 100,
                        proteins: 10,
                        fats: 5,
                        carbohydrates: 30,
                        category: 'Овощи',
                        preparation_status: 'Готовый к употреблению',
                    },
                    Array(5).fill(null)
                );
                expect(res.status).toBe(201);
            });

            test('6 фотографий - невалидно', async () => {
                const res = await createProductMultipart(
                    {
                        name: '6 фото',
                        calories: 100,
                        proteins: 10,
                        fats: 5,
                        carbohydrates: 30,
                        category: 'Овощи',
                        preparation_status: 'Готовый к употреблению',
                    },
                    Array(6).fill(null)
                );
                expect(res.status).toBe(400);
                expect(res.body.error).toMatch(/Максимальное количество изображений — 5/);
            });
        });
    });

    describe('GET /api/products - фильтрация, поиск, сортировка', () => {
        beforeAll(async () => {
            await axios.delete(`${BASE_URL}/test/reset`);

            await createProductMultipart({
                name: 'Морковь',
                calories: 50,
                proteins: 1,
                fats: 0,
                carbohydrates: 10,
                category: 'Овощи',
                preparation_status: 'Готовый к употреблению',
                flags: JSON.stringify(['Веган']),
            });
            await createProductMultipart({
                name: 'Курица',
                calories: 200,
                proteins: 25,
                fats: 10,
                carbohydrates: 0,
                category: 'Мясной',
                preparation_status: 'Требует приготовления',
                flags: JSON.stringify([]),
            });
            await createProductMultipart({
                name: 'Яблоко',
                calories: 60,
                proteins: 0.5,
                fats: 0.2,
                carbohydrates: 15,
                category: 'Овощи',
                preparation_status: 'Готовый к употреблению',
                flags: JSON.stringify(['Веган', 'Без глютена']),
            });
        });

        test('поиск по подстроке (регистронезависимый)', async () => {
            const res = await axios.get(`${BASE_URL}/products`, { params: { search: 'мор' } });
            expect(res.status).toBe(200);
            expect(res.data.length).toBe(1);
            expect(res.data[0].name).toBe('Морковь');
        });

        test('фильтр по категории', async () => {
            const res = await axios.get(`${BASE_URL}/products`, { params: { category: 'Овощи' } });
            expect(res.status).toBe(200);
            expect(res.data.length).toBe(2);
        });

        test('фильтр по preparation_status', async () => {
            const res = await axios.get(`${BASE_URL}/products`, { params: { preparation_status: 'Готовый к употреблению' } });
            expect(res.status).toBe(200);
            expect(res.data.length).toBe(2);
        });

        test('комбинированный фильтр (категория + флаги)', async () => {
            const res = await axios.get(`${BASE_URL}/products`, { params: { category: 'Овощи', flags: 'Веган' } });
            expect(res.status).toBe(200);
            expect(res.data.length).toBe(2);
        });

        test('сортировка по имени (алфавит, без учёта регистра)', async () => {
            const res = await axios.get(`${BASE_URL}/products`, { params: { sortBy: 'name', sortOrder: 'ASC' } });
            const names = res.data.map(p => p.name);
            expect(names).toEqual(['Курица', 'Морковь', 'Яблоко']);
        });

        test('сортировка по калориям', async () => {
            const res = await axios.get(`${BASE_URL}/products`, { params: { sortBy: 'calories', sortOrder: 'DESC' } });
            const calories = res.data.map(p => p.calories);
            expect(calories).toEqual([200, 60, 50]);
        });
    });

    describe('Удаление продукта', () => {
        test('удаление продукта, который используется в блюде, невозможно', async () => {
            const productRes = await createProductMultipart({
                name: 'Удаляемый продукт',
                calories: 100,
                proteins: 10,
                fats: 5,
                carbohydrates: 30,
                category: 'Овощи',
                preparation_status: 'Готовый к употреблению',
            });
            const product = productRes.body;

            await createDishMultipart({
                name: 'Блюдо с продуктом',
                serving_size: 200,
                category: 'Второе',
                products: [{ product_id: product.id, quantity: 100 }],
            });

            let delRes;
            try {
                delRes = await axios.delete(`${BASE_URL}/products/${product.id}`);
            } catch (err) {
                delRes = { status: err.response.status, data: err.response.data };
            }
            expect(delRes.status).toBe(400);
            expect(delRes.data.error).toMatch(/Невозможно удалить продукт/);
        });

        test('успешное удаление продукта, который нигде не используется', async () => {
            const productRes = await createProductMultipart({
                name: 'Свободный продукт',
                calories: 100,
                proteins: 10,
                fats: 5,
                carbohydrates: 30,
                category: 'Овощи',
                preparation_status: 'Готовый к употреблению',
            });
            const product = productRes.body;

            const delRes = await axios.delete(`${BASE_URL}/products/${product.id}`);
            expect(delRes.status).toBe(204);

            try {
                await axios.get(`${BASE_URL}/products/${product.id}`);
            } catch (err) {
                expect(err.response.status).toBe(404);
            }
        });
    });
});