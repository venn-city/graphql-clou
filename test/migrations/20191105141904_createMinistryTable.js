module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable(
      { schema: 'venn', tableName: 'ministries' },
      {
        id: {
          allowNull: false,
          primaryKey: true,
          type: Sequelize.STRING(30)
        },
        name: {
          type: Sequelize.STRING
        },
        budget_in_million_usd: {
          type: Sequelize.FLOAT
        },
        minister_id: {
          type: Sequelize.STRING,
          references: {
            model: {
              tableName: 'ministers',
              schema: 'venn'
            },
            key: 'id'
          }
        },
        government_id: {
          type: Sequelize.STRING,
          references: {
            model: {
              tableName: 'governments',
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
      tableName: 'ministries'
    });
  }
};
