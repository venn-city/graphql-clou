const { baseModel } = require('@venncity/sequelize-model');

module.exports = (sequelize, DataTypes) => {
  const lobbyist = sequelize.define(
    'Lobbyist',
    {
      ...baseModel,
      name: DataTypes.STRING
    },
    { underscored: true }
  );
  lobbyist.associate = ({ Lobbyist, Government }) => {
    Lobbyist.belongsToMany(Government, {
      as: 'governments',
      through: 'government_lobbyist_join_table',
      otherKey: 'government_id',
      foreignKey: 'lobbyist_id'
    });
  };
  return lobbyist;
};
