const { baseModel } = require('@venncity/sequelize-model/src/base/baseModel');

module.exports = (sequelize, DataTypes) => {
  const ministry = sequelize.define(
    'Ministry',
    {
      ...baseModel,
      name: DataTypes.STRING,
      budget: { type: DataTypes.FLOAT, field: 'budget_in_million_usd' }
    },
    { underscored: true }
  );
  ministry.associate = ({ Ministry, Government, Minister }) => {
    Ministry.belongsTo(Government, {
      as: 'government'
    });
    Ministry.belongsTo(Minister, {
      as: 'minister'
    });
  };
  return ministry;
};
