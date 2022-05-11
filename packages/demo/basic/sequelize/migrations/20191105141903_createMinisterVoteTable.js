module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable(
      { schema: 'venn', tableName: 'ministers_votes_join_table' },
      {
        minister_id: {
          type: Sequelize.STRING,
          primaryKey: true,
          references: {
            model: {
              tableName: 'ministers',
              schema: 'venn'
            },
            key: 'id'
          }
        },
        vote_id: {
          type: Sequelize.STRING,
          primaryKey: true,
          references: {
            model: {
              tableName: 'votes',
              schema: 'venn'
            },
            key: 'id'
          }
        },
        created_at: {
          allowNull: false,
          type: Sequelize.DATE
        },
        updated_at: {
          allowNull: false,
          type: Sequelize.DATE
        },
        deleted_at: {
          type: Sequelize.DATE
        },
        deleted: {
          type: Sequelize.INTEGER
        }
      }
    );
  },
  down: queryInterface => {
    return queryInterface.dropTable({
      schema: 'venn',
      tableName: 'ministers_votes_join_table'
    });
  }
};
