const { baseModel } = require('./../../src/base/baseModel');

module.exports = (sequelize, DataTypes) => {
  const government = sequelize.define(
    'Government',
    {
      ...baseModel,
      name: DataTypes.STRING
    },
    { underscored: true }
  );
  government.associate = ({ Government, Ministry }) => {
    Government.hasMany(Ministry, {
      as: 'ministries'
    });
  };
  return government;
};
