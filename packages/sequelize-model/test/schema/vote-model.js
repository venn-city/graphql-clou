const { baseModel } = require('./../../src/base/baseModel');

module.exports = (sequelize, DataTypes) => {
  const vote = sequelize.define(
    'Vote',
    {
      ...baseModel,
      name: DataTypes.STRING
    },
    { underscored: true }
  );
  vote.associate = ({ Vote, Minister }) => {
    Vote.belongsToMany(Minister, {
      as: 'minister',
      through: 'ministers_votes_join_table',
      foreignKey: 'vote_id',
      otherKey: 'minister_id'
    });
  };
  return vote;
};
