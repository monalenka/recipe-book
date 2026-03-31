const { Op } = require('sequelize');

const { Product, ProductImage, DishProduct, sequelize } = require('../models');

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
                order: [['sort_order', 'ASC']],
            },
        ],
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
                order: [['sort_order', 'ASC']],
            },
        ],
    });

    if (!product) {
        throw new Error('Product not found');
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

exports.updateProduct = async (id, productData, images) => {
    const transaction = await sequelize.transaction();

    try {
        const product = await Product.findByPk(id);
        if (!product) {
            throw new Error('Product not found');
        }

        await product.update(productData, { transaction });

        if (images !== undefined) {
            await ProductImage.destroy({
                where: { product_id: id },
                transaction,
            });

            if (images && images.length > 0) {
                const productImages = images.map((url, index) => ({
                    product_id: id,
                    image_url: url,
                    sort_order: index,
                }));
                await ProductImage.bulkCreate(productImages, { transaction });
            }
        }

        await transaction.commit();

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
                model: DishProduct,
                as: 'dishes',
                through: { attributes: [] },
            },
        ],
    });

    if (!product) {
        throw new Error('Product not found');
    }

    if (product.dishes && product.dishes.length > 0) {
        const dishNames = product.dishes.map(dish => dish.name).join(', ');
        throw new Error(`Cannot delete product. Used in dishes: ${dishNames}`);
    }

    await product.destroy();
    return true;
};