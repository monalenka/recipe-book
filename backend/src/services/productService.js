const { Product, ProductImage, DishProduct, Dish, sequelize } = require('../models');
const { Op } = require('sequelize');

exports.getAllProducts = async (filters) => {
    const where = {};
    const order = [];

    if (filters.search) {
        where.name = { [Op.iLike]: `%${filters.search}%` };
    }
    if (filters.category) {
        where.category = filters.category;
    }
    if (filters.preparation_status) {
        where.preparation_status = filters.preparation_status;
    }
    if (filters.flags) {
        const flagsArray = Array.isArray(filters.flags) ? filters.flags : [filters.flags];
        where.flags = { [Op.contains]: flagsArray };
    }

    if (filters.sortBy) {
        switch (filters.sortBy) {
            case 'name':
                order.push(['name', filters.sortOrder === 'desc' ? 'DESC' : 'ASC']);
                break;
            case 'calories':
                order.push(['calories', filters.sortOrder === 'desc' ? 'DESC' : 'ASC']);
                break;
            case 'proteins':
                order.push(['proteins', filters.sortOrder === 'desc' ? 'DESC' : 'ASC']);
                break;
            case 'fats':
                order.push(['fats', filters.sortOrder === 'desc' ? 'DESC' : 'ASC']);
                break;
            case 'carbohydrates':
                order.push(['carbohydrates', filters.sortOrder === 'desc' ? 'DESC' : 'ASC']);
                break;
            default:
                order.push(['name', 'ASC']);
        }
    } else {
        order.push(['name', 'ASC']);
    }

    const products = await Product.findAll({
        where,
        order,
        include: [
            {
                model: ProductImage,
                as: 'images',
                attributes: ['id', 'image_url', 'sort_order'],
            },
        ],
    });
    products.forEach(product => {
        if (product.images && product.images.length) {
            product.images.sort((a, b) => a.sort_order - b.sort_order);
        }
    });

    return products;
};

exports.getProductById = async (id) => {
    const product = await Product.findByPk(id, {
        include: [
            {
                model: ProductImage,
                as: 'images',
                attributes: ['id', 'image_url', 'sort_order'],
            },
        ],
    });

    if (!product) {
        throw new Error('Product not found');
    }

    if (product.images && product.images.length) {
        product.images.sort((a, b) => a.sort_order - b.sort_order);
    }

    return product;
};

exports.createProduct = async (productData, images) => {
    const transaction = await sequelize.transaction();

    try {
        const product = await Product.create(productData, { transaction });

        if (images && images.length > 0) {
            const productImages = images.map((url, index) => ({
                product_id: product.id,
                image_url: url,
                sort_order: index,
            }));
            await ProductImage.bulkCreate(productImages, { transaction });
        }

        await transaction.commit();
        return await exports.getProductById(product.id);
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};

exports.updateProduct = async (id, productData, images, existingImages) => {
    const transaction = await sequelize.transaction();
    try {
        const product = await Product.findByPk(id);
        if (!product) {
            throw new Error('Product not found');
        }

        await product.update(productData, { transaction });

        if (existingImages !== undefined) {
            const currentImages = await ProductImage.findAll({
                where: { product_id: id },
                attributes: ['id', 'image_url'],
                transaction,
            });

            const urlsToKeep = existingImages;
            const imagesToDelete = currentImages.filter(img => !urlsToKeep.includes(img.image_url));
            if (imagesToDelete.length) {
                await ProductImage.destroy({
                    where: { id: imagesToDelete.map(img => img.id) },
                    transaction,
                });
            }

            if (images && images.length > 0) {
                const productImages = images.map((url, index) => ({
                    product_id: id,
                    image_url: url,
                    sort_order: index,
                }));
                await ProductImage.bulkCreate(productImages, { transaction });
            }
        }
        console.log('existingImages received:', existingImages);
        if (existingImages !== undefined) {
            product.updated_at = new Date();
            const [updatedRows] = await sequelize.query(
                `UPDATE products SET updated_at = NOW() WHERE id = :id`,
                { replacements: { id }, type: sequelize.QueryTypes.UPDATE, transaction }
            );
            const reloaded = await Product.findByPk(id, { transaction });
        }
        console.log('Committing transaction...');
        await transaction.commit();
        console.log('Transaction committed');
        return await exports.getProductById(id);
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};

exports.deleteProduct = async (id) => {
    const product = await Product.findByPk(id, {
        include: [
            {
                model: Dish,
                as: 'dishes',
                through: { attributes: [] },
                attributes: ['id', 'name'],
            },
        ],
    });

    if (!product) {
        throw new Error('Product not found');
    }

    if (product.dishes && product.dishes.length > 0) {
        const dishNames = product.dishes.map(dish => dish.name).join(', ');
        throw new Error(`Невозможно удалить продукт. Он содержится в ${dishNames}`);
    }

    await product.destroy();
    return true;
};