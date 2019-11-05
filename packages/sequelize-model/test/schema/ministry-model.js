const { baseModel } = require('./../../src/base/baseModel');

module.exports = (sequelize, DataTypes) => {
  const ministry = sequelize.define(
    'Ministry',
    {
      ...baseModel,
      name: DataTypes.STRING
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
