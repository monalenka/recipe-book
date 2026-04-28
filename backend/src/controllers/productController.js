const productService = require('../services/productService');

exports.createProduct = async (req, res, next) => {
    try {
        let images = [];
        let productData;
        const isMultipart = req.is('multipart/form-data');

        if (isMultipart) {
            images = req.files ? req.files.map(file => `/uploads/${file.filename}`) : [];
            productData = {
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
        } else {
            productData = req.body;
            images = productData.images || [];
        }

        ['calories', 'proteins', 'fats', 'carbohydrates'].forEach(field => {
            if (productData[field] !== undefined) productData[field] = parseFloat(productData[field]);
        });

        const product = await productService.createProduct(productData, images);
        res.status(201).json(product);
    } catch (error) {
        next(error);
    }
};

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
        let flagsArray = null;
        if (flags) {
            flagsArray = Array.isArray(flags) ? flags : flags.split(',');
        }
        const filters = {
            search,
            category,
            preparation_status,
            flags: flagsArray,
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

exports.updateProduct = async (req, res, next) => {
    try {
        const images = (req.files && req.files.length > 0)
            ? req.files.map(file => `/uploads/${file.filename}`)
            : undefined;
        const existingImages = req.body.existingImages ? JSON.parse(req.body.existingImages) : undefined;

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

        const product = await productService.updateProduct(req.params.id, productData, images, existingImages);
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
        if (error.message.includes('Невозможно удалить продукт')) {
            res.status(400).json({ error: error.message });
        } else {
            next(error);
        }
    }
};