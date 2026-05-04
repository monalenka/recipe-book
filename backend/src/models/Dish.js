'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Dish extends Model {
        static associate(models) {
            Dish.hasMany(models.DishImage, { foreignKey: 'dish_id', as: 'images', onDelete: 'CASCADE' });
            Dish.belongsToMany(models.Product, {
                through: models.DishProduct,
                foreignKey: 'dish_id',
                otherKey: 'product_id',
                as: 'products',
            });
        }
    }
    Dish.init(
        {
            name: { type: DataTypes.STRING, allowNull: false, validate: { len: [2, 255] } },
            serving_size: { type: DataTypes.FLOAT, allowNull: false, validate: { min: 0.01 } },
            calories: { type: DataTypes.FLOAT, allowNull: false, defaultValue: 0, validate: { min: 0 } },
            proteins: { type: DataTypes.FLOAT, allowNull: false, defaultValue: 0, validate: { min: 0, max: 100 } },
            fats: { type: DataTypes.FLOAT, allowNull: false, defaultValue: 0, validate: { min: 0, max: 100 } },
            carbohydrates: { type: DataTypes.FLOAT, allowNull: false, defaultValue: 0, validate: { min: 0, max: 100 } },
            category: {
                type: DataTypes.ENUM('Десерт', 'Первое', 'Второе', 'Напиток', 'Салат', 'Суп', 'Перекус'),
                allowNull: false,
            },
            flags: { type: DataTypes.ARRAY(DataTypes.STRING), defaultValue: [], allowNull: false },
        },
        {
            sequelize,
            modelName: 'Dish',
            tableName: 'dishes',
            underscored: true,
            timestamps: true,
            createdAt: 'created_at',
            updatedAt: 'updated_at',
            updated_at: {
                type: DataTypes.DATE,
                allowNull: true,
            },
        }
    );
    return Dish;
};