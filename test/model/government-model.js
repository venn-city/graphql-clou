const { baseModel } = require('@venncity/sequelize-model');

module.exports = (sequelize, DataTypes) => {
  const government = sequelize.define(
    'Government',
    {
      ...baseModel,
      name: DataTypes.STRING,
      country: { type: DataTypes.STRING, field: 'country_code' }
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
