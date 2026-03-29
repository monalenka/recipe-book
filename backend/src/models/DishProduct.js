'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class DishProduct extends Model {
        static associate(models) {
            DishProduct.belongsTo(models.Dish, {
                foreignKey: 'dish_id',
                as: 'dish',
            });
            DishProduct.belongsTo(models.Product, {
                foreignKey: 'product_id',
                as: 'product',
            });
        }
    }
    DishProduct.init(
        {
            dish_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            product_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            quantity: {
                type: DataTypes.FLOAT,
                allowNull: false,
                validate: { min: 0 },
            },
        },
        {
            sequelize,
            modelName: 'DishProduct',
            tableName: 'dish_products',
            underscored: true,
            timestamps: true,
            createdAt: 'created_at',
            updatedAt: false,
        }
    );
    return DishProduct;
};