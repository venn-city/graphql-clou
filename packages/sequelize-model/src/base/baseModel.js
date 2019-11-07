const Sequelize = require('sequelize');

const baseModel = {
  id: {
    type: Sequelize.STRING,
    primaryKey: true
  },
  createdAt: Sequelize.DATE,
  updatedAt: Sequelize.DATE,
  deletedAt: Sequelize.DATE,
  deleted: Sequelize.NUMBER
};

module.exports = {
  baseModel
};
