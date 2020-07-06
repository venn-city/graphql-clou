"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.baseModel = void 0;
var sequelize_1 = __importDefault(require("@venncity/sequelize"));
// eslint-disable-next-line import/prefer-default-export
exports.baseModel = {
    id: {
        type: sequelize_1.default.STRING,
        primaryKey: true
    },
    createdAt: sequelize_1.default.DATE,
    updatedAt: sequelize_1.default.DATE,
    deletedAt: sequelize_1.default.DATE,
    deleted: {
        type: sequelize_1.default.INTEGER,
        allowNull: false,
        defaultValue: 0
    }
};
//# sourceMappingURL=baseModel.js.map