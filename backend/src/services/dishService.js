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

const validateBZUper100g = (proteinsPerServing, fatsPerServing, carbsPerServing, servingSize) => {
    if (!servingSize || servingSize <= 0) return;
    const totalPer100g = ((proteinsPerServing + fatsPerServing + carbsPerServing) / servingSize) * 100;
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
        const { products: productsData, name, category: formCategory, flags: requestedFlags, serving_size, ...restData } = dishData;

        if (!productsData || productsData.length === 0) {
            throw new Error('Dish must have at least one product');
        }

        if (!serving_size || serving_size <= 0) {
            throw new Error('Serving size must be positive');
        }

        const processedName = processMacroInName(name, formCategory);
        const finalCategory = processedName.category || formCategory;

        if (!finalCategory) {
            throw new Error('Category is required');
        }

        const productsWithDetails = await getProductsWithDetails(productsData);
        const nutrition = calculateDishNutrition(productsWithDetails);

        if (nutrition.totalWeight === 0) {
            throw new Error('Total weight of products cannot be zero');
        }

        const ratio = serving_size / nutrition.totalWeight;

        const calculatedCalories = nutrition.totalCalories * ratio;
        const calculatedProteins = nutrition.totalProteins * ratio;
        const calculatedFats = nutrition.totalFats * ratio;
        const calculatedCarbohydrates = nutrition.totalCarbohydrates * ratio;

        const availableFlags = calculateAvailableFlags(productsWithDetails);
        const finalFlags = validateFlags(requestedFlags || [], availableFlags);

        let finalCalories = restData.calories !== undefined ? restData.calories : calculatedCalories;
        let finalProteins = restData.proteins !== undefined ? restData.proteins : calculatedProteins;
        let finalFats = restData.fats !== undefined ? restData.fats : calculatedFats;
        let finalCarbohydrates = restData.carbohydrates !== undefined ? restData.carbohydrates : calculatedCarbohydrates;

        validateBZUper100g(finalProteins, finalFats, finalCarbohydrates, serving_size);

        const dish = await Dish.create(
            {
                ...restData,
                serving_size,
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

        const { products: productsData, name, category: formCategory, flags: requestedFlags, serving_size, ...restData } = dishData;

        let finalFlags = dish.flags;
        let calculatedNutrition = null;
        let newServingSize = serving_size !== undefined ? serving_size : dish.serving_size;

        if (productsData !== undefined) {
            if (productsData.length === 0) {
                throw new Error('Dish must have at least one product');
            }

            const productsWithDetails = await getProductsWithDetails(productsData);
            const nutrition = calculateDishNutrition(productsWithDetails);
            calculatedNutrition = nutrition;

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

        if (serving_size !== undefined) {
            updateData.serving_size = serving_size;
        }

        let finalProteins = dish.proteins;
        let finalFats = dish.fats;
        let finalCarbohydrates = dish.carbohydrates;
        let finalCalories = dish.calories;

        if (calculatedNutrition) {
            if (calculatedNutrition.totalWeight === 0) {
                throw new Error('Total weight of products cannot be zero');
            }
            const ratio = newServingSize / calculatedNutrition.totalWeight;
            const calculatedProteins = calculatedNutrition.totalProteins * ratio;
            const calculatedFats = calculatedNutrition.totalFats * ratio;
            const calculatedCarbohydrates = calculatedNutrition.totalCarbohydrates * ratio;
            const calculatedCalories = calculatedNutrition.totalCalories * ratio;

            if (restData.proteins === undefined) finalProteins = calculatedProteins;
            if (restData.fats === undefined) finalFats = calculatedFats;
            if (restData.carbohydrates === undefined) finalCarbohydrates = calculatedCarbohydrates;
            if (restData.calories === undefined) finalCalories = calculatedCalories;
        }

        if (restData.proteins !== undefined) finalProteins = restData.proteins;
        if (restData.fats !== undefined) finalFats = restData.fats;
        if (restData.carbohydrates !== undefined) finalCarbohydrates = restData.carbohydrates;
        if (restData.calories !== undefined) finalCalories = restData.calories;

        validateBZUper100g(finalProteins, finalFats, finalCarbohydrates, newServingSize);

        updateData.proteins = finalProteins;
        updateData.fats = finalFats;
        updateData.carbohydrates = finalCarbohydrates;
        updateData.calories = finalCalories;

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