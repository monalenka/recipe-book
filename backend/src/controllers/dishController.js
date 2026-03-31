const dishService = require('../services/dishService');

exports.getAllDishes = async (req, res, next) => {
    try {
        const { search, category, flags } = req.query;
        const filters = { search, category, flags };
        const dishes = await dishService.getAllDishes(filters);
        res.json(dishes);
    } catch (error) {
        next(error);
    }
};

exports.getDishById = async (req, res, next) => {
    try {
        const dish = await dishService.getDishById(req.params.id);
        res.json(dish);
    } catch (error) {
        next(error);
    }
};

exports.createDish = async (req, res, next) => {
    try {
        const images = req.files ? req.files.map(file => `/uploads/${file.filename}`) : [];
        const products = req.body.products ? JSON.parse(req.body.products) : [];
        const flags = req.body.flags ? JSON.parse(req.body.flags) : [];
        const category = req.body.category && req.body.category.trim() !== '' ? req.body.category : undefined;

        const dishData = {
            name: req.body.name,
            serving_size: parseFloat(req.body.serving_size),
            calories: req.body.calories !== undefined ? parseFloat(req.body.calories) : undefined,
            proteins: req.body.proteins !== undefined ? parseFloat(req.body.proteins) : undefined,
            fats: req.body.fats !== undefined ? parseFloat(req.body.fats) : undefined,
            carbohydrates: req.body.carbohydrates !== undefined ? parseFloat(req.body.carbohydrates) : undefined,
            category,
            flags,
            products,
        };

        const dish = await dishService.createDish(dishData, images);
        res.status(201).json(dish);
    } catch (error) {
        next(error);
    }
};

exports.updateDish = async (req, res, next) => {
    try {
        const images = (req.files && req.files.length > 0)
            ? req.files.map(file => `/uploads/${file.filename}`)
            : undefined;
        const products = req.body.products ? JSON.parse(req.body.products) : undefined;
        const flags = req.body.flags ? JSON.parse(req.body.flags) : undefined;
        const category = req.body.category && req.body.category.trim() !== '' ? req.body.category : undefined;

        const dishData = {
            name: req.body.name,
            serving_size: req.body.serving_size !== undefined ? parseFloat(req.body.serving_size) : undefined,
            calories: req.body.calories !== undefined ? parseFloat(req.body.calories) : undefined,
            proteins: req.body.proteins !== undefined ? parseFloat(req.body.proteins) : undefined,
            fats: req.body.fats !== undefined ? parseFloat(req.body.fats) : undefined,
            carbohydrates: req.body.carbohydrates !== undefined ? parseFloat(req.body.carbohydrates) : undefined,
            category,
            flags,
            products,
        };

        Object.keys(dishData).forEach(key => dishData[key] === undefined && delete dishData[key]);

        const dish = await dishService.updateDish(req.params.id, dishData, images);
        res.json(dish);
    } catch (error) {
        next(error);
    }
};

exports.deleteDish = async (req, res, next) => {
    try {
        await dishService.deleteDish(req.params.id);
        res.status(204).send();
    } catch (error) {
        next(error);
    }
};