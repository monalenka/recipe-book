const { Dish, DishImage, DishProduct, Product, sequelize } = require('../models');
const { Op } = require('sequelize');
const { calculateDishNutrition, checkDishFlagsAvailability, processMacroInName } = require('../utils/calculations');

const getProductsWithDetails = async (productsData) => {
    const productIds = productsData.map(p => p.product_id);
    const products = await Product.findAll({
        where: { id: productIds },
        attributes: ['id', 'name', 'calories', 'proteins', 'fats', 'carbohydrates', 'flags'],
    });

    return productsData.map(item => ({
        ...item,
        product: products.find(p => p.id === item.product_id),
    }));
};

const calculateAvailableFlags = (productsWithDetails) => {
    const productList = productsWithDetails.map(item => item.product);
    return checkDishFlagsAvailability(productList);
};

const validateFlags = (requestedFlags, availableFlags) => {
    if (!requestedFlags || requestedFlags.length === 0) return [];

    const validFlags = [];
    if (requestedFlags.includes('Веган') && !availableFlags.vegan) {
        throw new Error('Flag "Веган" is not available for this dish composition');
    }
    if (requestedFlags.includes('Без глютена') && !availableFlags.gluten_free) {
        throw new Error('Flag "Без глютена" is not available for this dish composition');
    }
    if (requestedFlags.includes('Без сахара') && !availableFlags.sugar_free) {
        throw new Error('Flag "Без сахара" is not available for this dish composition');
    }

    return requestedFlags.filter(flag =>
        (flag === 'Веган' && availableFlags.vegan) ||
        (flag === 'Без глютена' && availableFlags.gluten_free) ||
        (flag === 'Без сахара' && availableFlags.sugar_free)
    );
};

const validateBZUper100g = (proteins, fats, carbs, servingSize) => {
    if (!servingSize || servingSize <= 0) return;
    const totalPer100g = ((proteins + fats + carbs) / servingSize) * 100;
    if (totalPer100g > 100) {
        throw new Error('Сумма белков, жиров и углеводов в пересчёте на 100 г не может превышать 100');
    }
};

exports.getAllDishes = async (filters) => {
    const where = {};
    const order = [];

    if (filters.search) {
        where.name = { [Op.iLike]: `%${filters.search}%` };
    }

    if (filters.category) {
        where.category = filters.category;
    }

    if (filters.flags) {
        const flagsArray = Array.isArray(filters.flags) ? filters.flags : [filters.flags];
        where.flags = { [Op.contains]: flagsArray };
    }

    const dishes = await Dish.findAll({
        where,
        order: order.length ? order : [['name', 'ASC']],
        include: [
            {
                model: DishImage,
                as: 'images',
                attributes: ['id', 'image_url', 'sort_order'],
                order: [['sort_order', 'ASC']],
            },
        ],
    });

    return dishes;
};

exports.getDishById = async (id) => {
    const dish = await Dish.findByPk(id, {
        include: [
            {
                model: DishImage,
                as: 'images',
                attributes: ['id', 'image_url', 'sort_order'],
                order: [['sort_order', 'ASC']],
            },
            {
                model: Product,
                as: 'products',
                through: { attributes: ['quantity'] },
                attributes: ['id', 'name', 'calories', 'proteins', 'fats', 'carbohydrates', 'flags'],
            },
        ],
    });

    if (!dish) {
        throw new Error('Dish not found');
    }

    return dish;
};

exports.createDish = async (dishData, images) => {
    const transaction = await sequelize.transaction();

    try {
        const { products: productsData, name, category: formCategory, flags: requestedFlags, ...restData } = dishData;

        if (!productsData || productsData.length === 0) {
            throw new Error('Dish must have at least one product');
        }

        const processedName = processMacroInName(name, formCategory);
        const finalCategory = processedName.category || formCategory;

        if (!finalCategory) {
            throw new Error('Category is required');
        }

        const productsWithDetails = await getProductsWithDetails(productsData);
        const calculatedNutrition = calculateDishNutrition(productsWithDetails);
        const availableFlags = calculateAvailableFlags(productsWithDetails);
        const finalFlags = validateFlags(requestedFlags || [], availableFlags);

        let finalCalories = restData.calories !== undefined ? restData.calories : calculatedNutrition.calories;
        let finalProteins = restData.proteins !== undefined ? restData.proteins : calculatedNutrition.proteins;
        let finalFats = restData.fats !== undefined ? restData.fats : calculatedNutrition.fats;
        let finalCarbohydrates = restData.carbohydrates !== undefined ? restData.carbohydrates : calculatedNutrition.carbohydrates;

        validateBZUper100g(finalProteins, finalFats, finalCarbohydrates, restData.serving_size);

        const dish = await Dish.create(
            {
                ...restData,
                name: processedName.name,
                category: finalCategory,
                calories: finalCalories,
                proteins: finalProteins,
                fats: finalFats,
                carbohydrates: finalCarbohydrates,
                flags: finalFlags,
            },
            { transaction }
        );

        const dishProducts = productsData.map(item => ({
            dish_id: dish.id,
            product_id: item.product_id,
            quantity: item.quantity,
        }));
        await DishProduct.bulkCreate(dishProducts, { transaction });

        if (images && images.length > 0) {
            const dishImages = images.map((url, index) => ({
                dish_id: dish.id,
                image_url: url,
                sort_order: index,
            }));
            await DishImage.bulkCreate(dishImages, { transaction });
        }

        await transaction.commit();

        return await exports.getDishById(dish.id);
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};

exports.updateDish = async (id, dishData, images) => {
    const transaction = await sequelize.transaction();

    try {
        const dish = await Dish.findByPk(id);
        if (!dish) {
            throw new Error('Dish not found');
        }

        const { products: productsData, name, category: formCategory, flags: requestedFlags, ...restData } = dishData;

        let finalFlags = dish.flags;
        let calculatedNutrition = null;

        if (productsData !== undefined) {
            if (productsData.length === 0) {
                throw new Error('Dish must have at least one product');
            }

            const productsWithDetails = await getProductsWithDetails(productsData);
            calculatedNutrition = calculateDishNutrition(productsWithDetails);
            const availableFlags = calculateAvailableFlags(productsWithDetails);
            finalFlags = validateFlags(requestedFlags || dish.flags, availableFlags);

            await DishProduct.destroy({
                where: { dish_id: id },
                transaction,
            });

            const dishProducts = productsData.map(item => ({
                dish_id: id,
                product_id: item.product_id,
                quantity: item.quantity,
            }));
            await DishProduct.bulkCreate(dishProducts, { transaction });
        }

        let finalName = name !== undefined ? name : dish.name;
        let finalCategory = formCategory !== undefined ? formCategory : dish.category;

        if (name !== undefined) {
            const processedName = processMacroInName(name, formCategory);
            finalName = processedName.name;
            if (processedName.category && formCategory === undefined) {
                finalCategory = processedName.category;
            }
        }

        const updateData = {
            ...restData,
            name: finalName,
            category: finalCategory,
        };

        if (calculatedNutrition) {
            if (restData.calories === undefined) updateData.calories = calculatedNutrition.calories;
            if (restData.proteins === undefined) updateData.proteins = calculatedNutrition.proteins;
            if (restData.fats === undefined) updateData.fats = calculatedNutrition.fats;
            if (restData.carbohydrates === undefined) updateData.carbohydrates = calculatedNutrition.carbohydrates;
        }

        const finalProteins = updateData.proteins ?? dish.proteins;
        const finalFats = updateData.fats ?? dish.fats;
        const finalCarbohydrates = updateData.carbohydrates ?? dish.carbohydrates;
        const finalServingSize = updateData.serving_size ?? dish.serving_size;
        validateBZUper100g(finalProteins, finalFats, finalCarbohydrates, finalServingSize);

        if (requestedFlags !== undefined || productsData !== undefined) {
            updateData.flags = finalFlags;
        }

        await dish.update(updateData, { transaction });

        if (images !== undefined) {
            await DishImage.destroy({
                where: { dish_id: id },
                transaction,
            });

            if (images && images.length > 0) {
                const dishImages = images.map((url, index) => ({
                    dish_id: id,
                    image_url: url,
                    sort_order: index,
                }));
                await DishImage.bulkCreate(dishImages, { transaction });
            }
        }

        await transaction.commit();

        return await exports.getDishById(id);
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};

exports.deleteDish = async (id) => {
    const dish = await Dish.findByPk(id);
    if (!dish) {
        throw new Error('Dish not found');
    }

    await dish.destroy();
    return true;
};