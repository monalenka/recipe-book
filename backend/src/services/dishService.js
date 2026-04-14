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

exports.getAllDishes = async (filters) => {
    const where = {};
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
        order: [['name', 'ASC']],
        include: [
            {
                model: DishImage,
                as: 'images',
                attributes: ['id', 'image_url', 'sort_order'],
            },
        ],
    });

    dishes.forEach(dish => {
        if (dish.images && dish.images.length) {
            dish.images.sort((a, b) => a.sort_order - b.sort_order);
        }
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

    if (dish.images && dish.images.length) {
        dish.images.sort((a, b) => a.sort_order - b.sort_order);
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
        if (processedName.name.length < 2) {
            throw new Error('Название блюда после удаления макроса должно содержать минимум 2 символа');
        }
        const finalCategory = processedName.category || formCategory;
        if (!finalCategory) {
            throw new Error('Category is required');
        }

        const productsWithDetails = await getProductsWithDetails(productsData);
        const nutrition = calculateDishNutrition(productsWithDetails);
        if (nutrition.totalWeight === 0) {
            throw new Error('Total weight of products cannot be zero');
        }

        const calculatedCalories = nutrition.totalCalories;
        const calculatedProteins = nutrition.totalProteins;
        const calculatedFats = nutrition.totalFats;
        const calculatedCarbohydrates = nutrition.totalCarbohydrates;

        const availableFlags = calculateAvailableFlags(productsWithDetails);
        const finalFlags = validateFlags(requestedFlags || [], availableFlags);

        let finalCalories = restData.calories !== undefined ? restData.calories : calculatedCalories;
        let finalProteins = restData.proteins !== undefined ? restData.proteins : calculatedProteins;
        let finalFats = restData.fats !== undefined ? restData.fats : calculatedFats;
        let finalCarbohydrates = restData.carbohydrates !== undefined ? restData.carbohydrates : calculatedCarbohydrates;

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

exports.updateDish = async (id, dishData, images, existingImages) => {
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

            await DishProduct.destroy({ where: { dish_id: id }, transaction });
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
            if (processedName.name.length < 2) {
                throw new Error('Название блюда после удаления макроса должно содержать минимум 2 символа');
            }
            finalName = processedName.name;
            if (processedName.category && formCategory === undefined) {
                finalCategory = processedName.category;
            }
        }

        const updateData = { ...restData, name: finalName, category: finalCategory };
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
            if (restData.proteins === undefined) finalProteins = calculatedNutrition.totalProteins;
            if (restData.fats === undefined) finalFats = calculatedNutrition.totalFats;
            if (restData.carbohydrates === undefined) finalCarbohydrates = calculatedNutrition.totalCarbohydrates;
            if (restData.calories === undefined) finalCalories = calculatedNutrition.totalCalories;
        }
        if (restData.proteins !== undefined) finalProteins = restData.proteins;
        if (restData.fats !== undefined) finalFats = restData.fats;
        if (restData.carbohydrates !== undefined) finalCarbohydrates = restData.carbohydrates;
        if (restData.calories !== undefined) finalCalories = restData.calories;

        updateData.proteins = finalProteins;
        updateData.fats = finalFats;
        updateData.carbohydrates = finalCarbohydrates;
        updateData.calories = finalCalories;

        if (requestedFlags !== undefined || productsData !== undefined) {
            updateData.flags = finalFlags;
        }

        await dish.update(updateData, { transaction });

        if (existingImages !== undefined) {
            const currentImages = await DishImage.findAll({
                where: { dish_id: id },
                attributes: ['id', 'image_url'],
                transaction,
            });

            const urlsToKeep = existingImages;
            const imagesToDelete = currentImages.filter(img => !urlsToKeep.includes(img.image_url));
            if (imagesToDelete.length) {
                await DishImage.destroy({
                    where: { id: imagesToDelete.map(img => img.id) },
                    transaction,
                });
            }

            if (images && images.length > 0) {
                const dishImages = images.map((url, index) => ({
                    dish_id: id,
                    image_url: url,
                    sort_order: index,
                }));
                await DishImage.bulkCreate(dishImages, { transaction });
            }

            await sequelize.query(
                `UPDATE dishes SET updated_at = NOW() WHERE id = :id`,
                { replacements: { id }, type: sequelize.QueryTypes.UPDATE, transaction }
            );
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