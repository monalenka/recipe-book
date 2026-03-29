const validateProduct = (req, res, next) => {
    const { name, calories, proteins, fats, carbohydrates, category, preparation_status } = req.body;
    if (!name || name.length < 2) {
        return res.status(400).json({ error: 'Product name must be at least 2 characters' });
    }
    if (calories === undefined || isNaN(calories) || calories < 0) {
        return res.status(400).json({ error: 'Calories must be a non-negative number' });
    }
    // ... аналогично для остальных обязательных полей
    next();
};

const validateDish = (req, res, next) => {
    const { name, serving_size, category, products } = req.body;
    if (!name || name.length < 2) {
        return res.status(400).json({ error: 'Dish name must be at least 2 characters' });
    }
    if (serving_size === undefined || isNaN(serving_size) || serving_size <= 0) {
        return res.status(400).json({ error: 'Serving size must be greater than 0' });
    }
    if (!category) {
        return res.status(400).json({ error: 'Category is required' });
    }
    if (!products || !Array.isArray(products) || products.length === 0) {
        return res.status(400).json({ error: 'At least one product is required' });
    }
    next();
};

module.exports = { validateProduct, validateDish };