module.exports = {
    up: (queryInterface, Sequelize) => {
        return queryInterface.sequelize.transaction(async (transaction) => {
            await queryInterface.addColumn({ schema: 'venn', tableName: 'ministries' },
                'domains',
                {
                    type: Sequelize.ARRAY(Sequelize.STRING),
                    allowNull: true,
                },
                { transaction });
        });
    },
    down: (queryInterface, Sequelize) => {
        return queryInterface.sequelize.transaction(async (transaction) => {
            await queryInterface.removeColumn({ schema: 'venn', tableName: 'ministries' },
                'domains',
                {
                    type: Sequelize.ARRAY(Sequelize.String),
                    allowNull: true
                },
                { transaction });
        });
    }
};
