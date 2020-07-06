"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var lodash_1 = require("lodash");
var sequelize_data_provider_1 = require("@venncity/sequelize-data-provider");
var util = require('util');
var async = require('async');
var pluralize = require('pluralize');
var getFieldType = require('@venncity/opencrud-schema-provider').introspectionUtils.getFieldType;
var eachOfAsync = util.promisify(async.eachOf);
var CASCADE_DIRECTIVE = 'vnCascade';
var DELETE_OPERATION = 'DELETE';
var DISCONNECT_OPERATION = 'DISCONNECT';
var DIRECT = 'direct';
var INVERSE = 'inverse';
function cascadeDelete(_a) {
    var entityName = _a.entityName, entityId = _a.entityId, context = _a.context;
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, cascadeReferencedEntities(entityName, entityId, context)];
                case 1:
                    _b.sent();
                    return [4 /*yield*/, cascadeReferencingEntities(entityName, entityId, context)];
                case 2:
                    _b.sent();
                    return [2 /*return*/];
            }
        });
    });
}
function cascadeReferencedEntities(entityName, entityId, context) {
    return __awaiter(this, void 0, void 0, function () {
        var fieldsToCascade;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    fieldsToCascade = getReferencedFieldsToCascade(context, entityName);
                    return [4 /*yield*/, eachOfAsync(fieldsToCascade, function (fieldToCascade) { return __awaiter(_this, void 0, void 0, function () {
                            var fieldType, _a, shouldDelete, shouldDisconnect, entityIdToCascade;
                            var _this = this;
                            return __generator(this, function (_b) {
                                switch (_b.label) {
                                    case 0:
                                        fieldType = getFieldType(fieldToCascade);
                                        _a = getDirectiveOperations(fieldToCascade.directives, DIRECT), shouldDelete = _a.shouldDelete, shouldDisconnect = _a.shouldDisconnect;
                                        return [4 /*yield*/, sequelize_data_provider_1.sequelizeDataProvider.getRelatedEntityIds(entityName, entityId, fieldToCascade.name)];
                                    case 1:
                                        entityIdToCascade = _b.sent();
                                        if (!entityIdToCascade) return [3 /*break*/, 5];
                                        if (!Array.isArray(entityIdToCascade)) {
                                            entityIdToCascade = [entityIdToCascade];
                                        }
                                        if (!shouldDisconnect) return [3 /*break*/, 3];
                                        return [4 /*yield*/, eachOfAsync(entityIdToCascade, function (idToCascade) { return __awaiter(_this, void 0, void 0, function () {
                                                return __generator(this, function (_a) {
                                                    switch (_a.label) {
                                                        case 0:
                                                            if (!shouldDelete) return [3 /*break*/, 2];
                                                            return [4 /*yield*/, runPreDeletionOfNextEntity(fieldType, idToCascade, context)];
                                                        case 1:
                                                            _a.sent();
                                                            _a.label = 2;
                                                        case 2: return [4 /*yield*/, performDisconnect(entityName, entityId, idToCascade, fieldToCascade, context)];
                                                        case 3:
                                                            _a.sent();
                                                            return [2 /*return*/];
                                                    }
                                                });
                                            }); })];
                                    case 2:
                                        _b.sent();
                                        _b.label = 3;
                                    case 3:
                                        if (!shouldDelete) return [3 /*break*/, 5];
                                        return [4 /*yield*/, deleteMany(fieldType, entityIdToCascade, context)];
                                    case 4:
                                        _b.sent();
                                        _b.label = 5;
                                    case 5: return [2 /*return*/];
                                }
                            });
                        }); })];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
function runPreDeletionOfNextEntity(fieldType, idToCascade, context) {
    return __awaiter(this, void 0, void 0, function () {
        var joinEntityDAOhooks;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    idToCascade = idToCascade.id || idToCascade;
                    return [4 /*yield*/, context.DAOs[lodash_1.lowerFirst(fieldType) + "DAO"].getHooks()];
                case 1:
                    joinEntityDAOhooks = _a.sent();
                    return [4 /*yield*/, joinEntityDAOhooks.preDelete(context, { id: idToCascade })];
                case 2:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
function cascadeReferencingEntities(originalEntityName, originalEntityId, context) {
    return __awaiter(this, void 0, void 0, function () {
        var allEntitiesTypes;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    allEntitiesTypes = context.openCrudDataModel.types;
                    return [4 /*yield*/, eachOfAsync(allEntitiesTypes, function (entity) { return __awaiter(_this, void 0, void 0, function () {
                            var entityFields, fieldsToCascade, referencingEntityName;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        entityFields = entity.fields;
                                        fieldsToCascade = getReferencingFieldsToCascade(entityFields, originalEntityName);
                                        if (!fieldsToCascade.length) return [3 /*break*/, 2];
                                        referencingEntityName = entity.name;
                                        return [4 /*yield*/, handleReferencingEntities(originalEntityName, referencingEntityName, originalEntityId, fieldsToCascade, context)];
                                    case 1:
                                        _a.sent();
                                        _a.label = 2;
                                    case 2: return [2 /*return*/];
                                }
                            });
                        }); })];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
function handleReferencingEntities(originalEntityName, referencingEntityName, originalEntityId, fieldsToCascade, context) {
    return __awaiter(this, void 0, void 0, function () {
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, eachOfAsync(fieldsToCascade, function (fieldToCascade) { return __awaiter(_this, void 0, void 0, function () {
                        var where, entityIdsToCascade, _a, _b, shouldDelete_1, shouldDisconnect;
                        var _c, _d;
                        var _this = this;
                        return __generator(this, function (_e) {
                            switch (_e.label) {
                                case 0:
                                    if (fieldToCascade.isList) {
                                        where = (_c = {},
                                            _c[fieldToCascade.name + "_some"] = { id: originalEntityId },
                                            _c);
                                    }
                                    else {
                                        where = (_d = {},
                                            _d[fieldToCascade.name] = { id: originalEntityId },
                                            _d);
                                    }
                                    _a = lodash_1.map;
                                    return [4 /*yield*/, sequelize_data_provider_1.sequelizeDataProvider.getAllEntities(referencingEntityName, { where: where })];
                                case 1:
                                    entityIdsToCascade = _a.apply(void 0, [_e.sent(), 'id']);
                                    if (!entityIdsToCascade.length) return [3 /*break*/, 5];
                                    _b = getDirectiveOperations(fieldToCascade.directives, INVERSE), shouldDelete_1 = _b.shouldDelete, shouldDisconnect = _b.shouldDisconnect;
                                    if (!shouldDisconnect) return [3 /*break*/, 3];
                                    return [4 /*yield*/, eachOfAsync(entityIdsToCascade, function (entityIdToCascade) { return __awaiter(_this, void 0, void 0, function () {
                                            return __generator(this, function (_a) {
                                                switch (_a.label) {
                                                    case 0:
                                                        if (!shouldDelete_1) return [3 /*break*/, 2];
                                                        return [4 /*yield*/, runPreDeletionOfNextEntity(referencingEntityName, entityIdToCascade, context)];
                                                    case 1:
                                                        _a.sent();
                                                        _a.label = 2;
                                                    case 2: return [4 /*yield*/, performDisconnect(referencingEntityName, entityIdToCascade, originalEntityId, fieldToCascade, context)];
                                                    case 3:
                                                        _a.sent();
                                                        return [2 /*return*/];
                                                }
                                            });
                                        }); })];
                                case 2:
                                    _e.sent();
                                    _e.label = 3;
                                case 3:
                                    if (!shouldDelete_1) return [3 /*break*/, 5];
                                    return [4 /*yield*/, deleteMany(referencingEntityName, entityIdsToCascade, context)];
                                case 4:
                                    _e.sent();
                                    _e.label = 5;
                                case 5: return [2 /*return*/];
                            }
                        });
                    }); })];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
function deleteMany(fieldType, idsToDelete, context) {
    return __awaiter(this, void 0, void 0, function () {
        var joinFieldDAO;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    joinFieldDAO = context.DAOs[lodash_1.lowerFirst(fieldType) + "DAO"];
                    return [4 /*yield*/, joinFieldDAO["deleteMany" + pluralize(fieldType)](context, {
                            id_in: idsToDelete.map(function (idToDelete) { return idToDelete.id || idToDelete; })
                        })];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
function performDisconnect(entityName, entityId, entityIdToDisconnect, fieldToDisconnect, context) {
    return __awaiter(this, void 0, void 0, function () {
        var entityDAO, disconnect;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    entityIdToDisconnect = entityIdToDisconnect.id || entityIdToDisconnect;
                    entityId = entityId.id || entityId;
                    entityDAO = context.DAOs[lodash_1.lowerFirst(entityName) + "DAO"];
                    disconnect = fieldToDisconnect.isList ? { id: entityIdToDisconnect } : true;
                    return [4 /*yield*/, entityDAO["update" + lodash_1.upperFirst(entityName)](context, {
                            data: (_a = {},
                                _a[fieldToDisconnect.name] = { disconnect: disconnect },
                                _a),
                            where: { id: entityId }
                        })];
                case 1:
                    _b.sent();
                    return [2 /*return*/];
            }
        });
    });
}
function getDirectiveOperations(directives, direction) {
    var cascadeOperations = directives.find(function (d) { return lodash_1.isEqual(d.name, CASCADE_DIRECTIVE); }).arguments[direction];
    var shouldDelete = cascadeOperations.includes(DELETE_OPERATION);
    var shouldDisconnect = cascadeOperations.includes(DISCONNECT_OPERATION);
    return { shouldDelete: shouldDelete, shouldDisconnect: shouldDisconnect };
}
function getReferencedFieldsToCascade(context, entityName) {
    var entityFields = context.openCrudDataModel.types.find(function (t) { return t.name === lodash_1.upperFirst(entityName); }).fields;
    return entityFields.filter(function (f) {
        return f.directives.find(function (d) {
            return _.isEqual(d.name, CASCADE_DIRECTIVE) && d.arguments.direct;
        });
    });
}
function getReferencingFieldsToCascade(entityFields, originalEntityName) {
    return entityFields.filter(function (f) {
        if (lodash_1.lowerFirst(getFieldType(f)) === originalEntityName) {
            return f.directives.some(function (d) { return lodash_1.isEqual(d.name, CASCADE_DIRECTIVE) && d.arguments.inverse; });
        }
        return false;
    });
}
module.exports = {
    cascadeDelete: cascadeDelete,
    getDirectiveOperations: getDirectiveOperations,
    getReferencedFieldsToCascade: getReferencedFieldsToCascade,
    getReferencingFieldsToCascade: getReferencingFieldsToCascade
};
//# sourceMappingURL=cascadeDelete.js.map