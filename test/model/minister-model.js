const { baseModel } = require('@venncity/sequelize-model/src/base/baseModel');

module.exports = (sequelize, DataTypes) => {
  const minister = sequelize.define(
    'Minister',
    {
      ...baseModel,
      name: DataTypes.STRING
    },
    { underscored: true }
  );
  minister.associate = ({ Minister, Ministry, Vote }) => {
    Minister.hasOne(Ministry, {
      as: 'ministry', foreignKey: 'minister_id'
    });
    Minister.belongsToMany(Vote, {
      as: 'votes',
      through: 'ministers_votes_join_table',
      foreignKey: 'minister_id',
      otherKey: 'vote_id'
    });
  };
  return minister;
};
