import Sequelize from '@venncity/sequelize';

// eslint-disable-next-line import/prefer-default-export
export const baseModel = {
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
