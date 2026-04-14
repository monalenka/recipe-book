'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Product extends Model {
        static associate(models) {
            Product.hasMany(models.ProductImage, {
                foreignKey: 'product_id',
                as: 'images',
                onDelete: 'CASCADE',
            });
            Product.belongsToMany(models.Dish, {
                through: models.DishProduct,
                foreignKey: 'product_id',
                otherKey: 'dish_id',
                as: 'dishes',
            });
        }
    }
    Product.init(
        {
            name: { type: DataTypes.STRING, allowNull: false, validate: { len: [2, 255] } },
            calories: { type: DataTypes.FLOAT, allowNull: false, defaultValue: 0, validate: { min: 0 } },
            proteins: { type: DataTypes.FLOAT, allowNull: false, defaultValue: 0, validate: { min: 0, max: 100 } },
            fats: { type: DataTypes.FLOAT, allowNull: false, defaultValue: 0, validate: { min: 0, max: 100 } },
            carbohydrates: { type: DataTypes.FLOAT, allowNull: false, defaultValue: 0, validate: { min: 0, max: 100 } },
            ingredients: { type: DataTypes.TEXT, allowNull: true },
            category: {
                type: DataTypes.ENUM('Замороженный', 'Мясной', 'Овощи', 'Зелень', 'Специи', 'Крупы', 'Консервы', 'Жидкость', 'Сладости'),
                allowNull: false,
            },
            preparation_status: {
                type: DataTypes.ENUM('Готовый к употреблению', 'Полуфабрикат', 'Требует приготовления'),
                allowNull: false,
            },
            flags: { type: DataTypes.ARRAY(DataTypes.STRING), defaultValue: [], allowNull: false },
        },
        {
            sequelize,
            modelName: 'Product',
            tableName: 'products',
            underscored: true,
            timestamps: true,
            createdAt: 'created_at',
            updatedAt: 'updated_at',
            hooks: {
                beforeCreate: (product) => {
                    product.updated_at = null;
                }
            },
            validate: {
                bzuSumValid() {
                    const sum = this.proteins + this.fats + this.carbohydrates;
                    if (sum > 100) throw new Error('Сумма БЖУ на 100 г не может превышать 100');
                },
            },
        }
    );
    return Product;
};