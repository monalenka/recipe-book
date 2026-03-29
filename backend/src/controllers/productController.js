const productService = require('../services/productService');

exports.getAllProducts = async (req, res, next) => {
    try {
        const {
            search,
            category,
            preparation_status,
            flags,
            sortBy,
            sortOrder,
        } = req.query;

        const filters = {
            search,
            category,
            preparation_status,
            flags,
            sortBy,
            sortOrder,
        };

        const products = await productService.getAllProducts(filters);
        res.json(products);
    } catch (error) {
        next(error);
    }
};

exports.getProductById = async (req, res, next) => {
    try {
        const product = await productService.getProductById(req.params.id);
        res.json(product);
    } catch (error) {
        next(error);
    }
};

exports.createProduct = async (req, res, next) => {
    try {
        const images = req.files ? req.files.map(file => `/uploads/${file.filename}`) : [];
        const productData = {
            name: req.body.name,
            calories: parseFloat(req.body.calories),
            proteins: parseFloat(req.body.proteins),
            fats: parseFloat(req.body.fats),
            carbohydrates: parseFloat(req.body.carbohydrates),
            ingredients: req.body.ingredients || null,
            category: req.body.category,
            preparation_status: req.body.preparation_status,
            flags: req.body.flags ? JSON.parse(req.body.flags) : [],
        };

        const product = await productService.createProduct(productData, images);
        res.status(201).json(product);
    } catch (error) {
        next(error);
    }
};

exports.updateProduct = async (req, res, next) => {
    try {
        const images = req.files ? req.files.map(file => `/uploads/${file.filename}`) : undefined;
        const productData = {
            name: req.body.name,
            calories: req.body.calories !== undefined ? parseFloat(req.body.calories) : undefined,
            proteins: req.body.proteins !== undefined ? parseFloat(req.body.proteins) : undefined,
            fats: req.body.fats !== undefined ? parseFloat(req.body.fats) : undefined,
            carbohydrates: req.body.carbohydrates !== undefined ? parseFloat(req.body.carbohydrates) : undefined,
            ingredients: req.body.ingredients,
            category: req.body.category,
            preparation_status: req.body.preparation_status,
            flags: req.body.flags ? JSON.parse(req.body.flags) : undefined,
        };

        Object.keys(productData).forEach(key => productData[key] === undefined && delete productData[key]);

        const product = await productService.updateProduct(req.params.id, productData, images);
        res.json(product);
    } catch (error) {
        next(error);
    }
};

exports.deleteProduct = async (req, res, next) => {
    try {
        await productService.deleteProduct(req.params.id);
        res.status(204).send();
    } catch (error) {
        next(error);
    }
};