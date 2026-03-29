'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('products', {
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
      ingredients: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      category: {
        type: Sequelize.ENUM(
          'Замороженный',
          'Мясной',
          'Овощи',
          'Зелень',
          'Специи',
          'Крупы',
          'Консервы',
          'Жидкость',
          'Сладости'
        ),
        allowNull: false,
      },
      preparation_status: {
        type: Sequelize.ENUM('Готовый к употреблению', 'Полуфабрикат', 'Требует приготовления'),
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
    await queryInterface.dropTable('products');
  },
};