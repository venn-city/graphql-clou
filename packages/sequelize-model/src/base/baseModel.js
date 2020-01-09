const Sequelize = require('@venncity/sequelize');

const baseModel = {
  id: {
    type: Sequelize.STRING,
    primaryKey: true
  },
  createdAt: Sequelize.DATE,
  updatedAt: Sequelize.DATE,
  deletedAt: Sequelize.DATE,
  deleted: {
    type: Sequelize.INTEGER,
    allowNull: false,
    defaultValue: 0
  }
};

module.exports = {
  baseModel
};
