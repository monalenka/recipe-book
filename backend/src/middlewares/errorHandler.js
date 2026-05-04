const multer = require('multer');

module.exports = (err, req, res, next) => {
    console.error(err);

    if (err.errors && Array.isArray(err.errors)) {
        const message = err.errors[0].message;
        return res.status(400).json({ error: message });
    }

    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_COUNT') {
            return res.status(400).json({ error: 'Максимальное количество изображений — 5' });
        }
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ error: 'Размер файла не должен превышать 5 МБ' });
        }
        return res.status(400).json({ error: err.message });
    }

    const msg = err.message;
    if (msg === 'Product not found' || msg === 'Dish not found') {
        return res.status(404).json({ error: msg });
    }
    if (msg && msg.startsWith('Cannot delete product')) {
        return res.status(400).json({ error: msg });
    }
    if (msg === 'Dish must have at least one product') {
        return res.status(400).json({ error: 'Состав не может быть пустым' });
    }
    if (msg === 'Category is required') {
        return res.status(400).json({ error: msg });
    }
    if (msg && msg.includes('Flag') && msg.includes('not available')) {
        return res.status(400).json({ error: msg });
    }
    if (msg === 'Only image files are allowed') {
        return res.status(400).json({ error: msg });
    }
    if (msg && msg.includes('Сумма белков, жиров и углеводов')) {
        return res.status(400).json({ error: msg });
    }
    if (msg && msg.includes('Название блюда после удаления макроса должно содержать минимум 2 символа')) {
        return res.status(400).json({ error: msg });
    }
    if (msg === 'Product quantity must be greater than 0') {
        return res.status(400).json({ error: 'Количество продукта должно быть больше 0' });
    }
    if (msg && msg.includes('not found')) {
        return res.status(404).json({ error: msg });
    }

    return res.status(500).json({ error: 'Внутренняя ошибка сервера' });
};