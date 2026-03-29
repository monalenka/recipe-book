'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('dishes', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      name: {
        type: Sequelize.STRING(255),
        allowNull: false,
        validate: {
          len: [2, 255],
        },
      },
      serving_size: {
        type: Sequelize.FLOAT,
        allowNull: false,
        validate: {
          min: 0,
        },
      },
      calories: {
        type: Sequelize.FLOAT,
        allowNull: false,
        defaultValue: 0,
      },
      proteins: {
        type: Sequelize.FLOAT,
        allowNull: false,
        defaultValue: 0,
      },
      fats: {
        type: Sequelize.FLOAT,
        allowNull: false,
        defaultValue: 0,
      },
      carbohydrates: {
        type: Sequelize.FLOAT,
        allowNull: false,
        defaultValue: 0,
      },
      category: {
        type: Sequelize.ENUM(
          'Десерт',
          'Первое',
          'Второе',
          'Напиток',
          'Салат',
          'Суп',
          'Перекус'
        ),
        allowNull: false,
      },
      flags: {
        type: Sequelize.ARRAY(Sequelize.STRING),
        defaultValue: [],
        allowNull: false,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('dishes');
  },
};