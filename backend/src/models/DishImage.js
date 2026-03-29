'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class DishImage extends Model {
        static associate(models) {
            DishImage.belongsTo(models.Dish, {
                foreignKey: 'dish_id',
                as: 'dish',
            });
        }
    }
    DishImage.init(
        {
            dish_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            image_url: {
                type: DataTypes.STRING(500),
                allowNull: false,
            },
            sort_order: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 0,
            },
        },
        {
            sequelize,
            modelName: 'DishImage',
            tableName: 'dish_images',
            underscored: true,
            timestamps: true,
            createdAt: 'created_at',
            updatedAt: false,
        }
    );
    return DishImage;
};