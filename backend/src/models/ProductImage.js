'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class ProductImage extends Model {
        static associate(models) {
            ProductImage.belongsTo(models.Product, {
                foreignKey: 'product_id',
                as: 'product',
            });
        }
    }
    ProductImage.init(
        {
            product_id: {
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
            modelName: 'ProductImage',
            tableName: 'product_images',
            underscored: true,
            timestamps: true,
            createdAt: 'created_at',
            updatedAt: false,
        }
    );
    return ProductImage;
};