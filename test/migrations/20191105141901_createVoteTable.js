module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable(
      { schema: "venn", tableName: "votes" },
      {
        id: {
          allowNull: false,
          primaryKey: true,
          type: Sequelize.STRING(30)
        },
        name: {
          type: Sequelize.STRING
        },
        ballot: {
          type: Sequelize.STRING
        },
        law_info: {
          type: Sequelize.STRING
        },
        law_info_json: {
          type: Sequelize.JSON
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
      schema: "venn",
      tableName: "votes"
    });
  }
};
