"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCommonDbColumnDefinitions = void 0;
// eslint-disable-next-line import/prefer-default-export
function getCommonDbColumnDefinitions(Sequelize) {
    return {
        id: {
            allowNull: false,
            primaryKey: true,
            type: Sequelize.STRING
        },
        deleted_at: {
            type: Sequelize.DATE
        },
        deleted: {
            type: Sequelize.INTEGER,
            defaultValue: 0
        },
        created_at: {
            allowNull: false,
            type: Sequelize.DATE,
            defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
        },
        updated_at: {
            type: Sequelize.DATE
        }
    };
}
exports.getCommonDbColumnDefinitions = getCommonDbColumnDefinitions;
//# sourceMappingURL=commonColumnDefintions.js.map