module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable(
      { schema: 'venn', tableName: 'government_lobbyist_join_table' },
      {
        government_id: {
          type: Sequelize.STRING,
          primaryKey: true,
          references: {
            model: {
              tableName: 'governments',
              schema: 'venn'
            },
            key: 'id'
          }
        },
        lobbyist_id: {
          type: Sequelize.STRING,
          primaryKey: true,
          references: {
            model: {
              tableName: 'lobbyists',
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
  down: (queryInterface) => {
    return queryInterface.dropTable({
      schema: 'venn',
      tableName: 'government_lobbyist_join_table'
    });
  }
};
