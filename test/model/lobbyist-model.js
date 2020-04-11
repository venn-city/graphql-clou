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
      foreignKey: 'government_id',
      otherKey: 'lobbyist_id'
    });
  };
  return lobbyist;
};
