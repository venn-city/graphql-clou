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
  government.associate = ({ Government, Ministry, Lobbyist }) => {
    Government.hasMany(Ministry, {
      as: 'ministries'
    });
    Government.belongsToMany(Lobbyist, {
      as: 'lobbyists',
      through: 'government_lobbyist_join_table',
      foreignKey: 'lobbyist_id',
      otherKey: 'government_id'
    });
  };
  return government;
};
