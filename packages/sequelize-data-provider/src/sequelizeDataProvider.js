"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var lodash_1 = require("lodash");
var cuid_1 = __importDefault(require("cuid"));
var sequelize_1 = __importDefault(require("@venncity/sequelize"));
var errors_1 = require("@venncity/errors");
var util_1 = __importDefault(require("util"));
var async_1 = __importDefault(require("async"));
var graphql_transformers_1 = require("@venncity/graphql-transformers");
var sequelize_model_1 = require("@venncity/sequelize-model");
var opencrud_schema_provider_1 = __importDefault(require("@venncity/opencrud-schema-provider"));
var ClientDataValidationError = errors_1.errors.ClientDataValidationError, ServerDataValidationError = errors_1.errors.ServerDataValidationError, WARN = errors_1.errors.SUPPORTED_LOG_LEVELS.WARN;
var CREATE_MANY = true;
var getFieldType = opencrud_schema_provider_1.default.graphqlSchemaUtils.getFieldType;
var openCrudDataModel = opencrud_schema_provider_1.default.openCrudDataModel, schema = opencrud_schema_provider_1.default.openCrudSchema;
var Op = sequelize_1.default.Op;
var asyncEach = util_1.default.promisify(async_1.default.each);
var asyncMap = util_1.default.promisify(async_1.default.map);
function getEntity(entityName, where) {
    return __awaiter(this, void 0, void 0, function () {
        var fetchedEntity;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, model(entityName).findOne({ where: where })];
                case 1:
                    fetchedEntity = _a.sent();
                    return [2 /*return*/, fetchedEntity && fetchedEntity.dataValues];
            }
        });
    });
}
function getAllEntities(entityName, args) {
    return __awaiter(this, void 0, void 0, function () {
        var fetchedEntities;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getAllEntitiesSqObjects(args, entityName)];
                case 1:
                    fetchedEntities = _a.sent();
                    return [2 /*return*/, lodash_1.map(fetchedEntities, 'dataValues')];
            }
        });
    });
}
function getAllEntitiesSqObjects(args, entityName) {
    return __awaiter(this, void 0, void 0, function () {
        var sqFilter;
        return __generator(this, function (_a) {
            sqFilter = args && graphql_transformers_1.openCrudToSequelize(args, lodash_1.upperFirst(entityName));
            return [2 /*return*/, model(entityName).findAll(sqFilter)];
        });
    });
}
function getRelatedEntityId(entityName, originalEntityId, relationEntityName) {
    return __awaiter(this, void 0, void 0, function () {
        var relation;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getRelatedEntity(entityName, originalEntityId, relationEntityName)];
                case 1:
                    relation = _a.sent();
                    return [2 /*return*/, relation && relation.id];
            }
        });
    });
}
function getRelatedEntity(entityName, originalEntityId, relationFieldName) {
    return __awaiter(this, void 0, void 0, function () {
        var originalEntity;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, model(entityName).findOne({
                        where: { id: originalEntityId },
                        include: {
                            model: model(getFieldType(schema, entityName, relationFieldName)),
                            as: relationFieldName,
                            required: true
                        }
                    })];
                case 1:
                    originalEntity = _a.sent();
                    return [2 /*return*/, (originalEntity &&
                            (Array.isArray(originalEntity[relationFieldName]) && originalEntity[relationFieldName].length === 1
                                ? originalEntity[relationFieldName][0].dataValues // [0] is required in cases of many-to-one mappings using a join-table.
                                : originalEntity[relationFieldName].dataValues))];
            }
        });
    });
}
function getRelatedEntityIds(entityName, originalEntityId, relationEntityName, args) {
    return __awaiter(this, void 0, void 0, function () {
        var relations;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getRelatedEntities(entityName, originalEntityId, relationEntityName, args)];
                case 1:
                    relations = _a.sent();
                    return [2 /*return*/, relations && (Array.isArray(relations) ? relations.map(function (relation) { return relation.id; }) : relations.id)];
            }
        });
    });
}
function getRelatedEntities(entityName, originalEntityId, relationFieldName, args) {
    return __awaiter(this, void 0, void 0, function () {
        var relatedEntityName, relatedEntityFilter, originalEntity, relatedEntities, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    relatedEntityName = getFieldType(schema, entityName, relationFieldName);
                    relatedEntityFilter = args && graphql_transformers_1.openCrudToSequelize(args, lodash_1.upperFirst(relatedEntityName));
                    return [4 /*yield*/, model(entityName).findOne({ where: { id: originalEntityId } })];
                case 1:
                    originalEntity = _b.sent();
                    if (!originalEntity) return [3 /*break*/, 3];
                    return [4 /*yield*/, originalEntity["get" + lodash_1.upperFirst(relationFieldName)](relatedEntityFilter)];
                case 2:
                    _a = _b.sent();
                    return [3 /*break*/, 4];
                case 3:
                    _a = [];
                    _b.label = 4;
                case 4:
                    relatedEntities = _a;
                    if (Array.isArray(relatedEntities)) {
                        return [2 /*return*/, relatedEntities.map(function (relatedEntity) { return relatedEntity.dataValues; })];
                    }
                    return [2 /*return*/, relatedEntities ? relatedEntities.dataValues : []];
            }
        });
    });
}
function createEntity(entityName, entityToCreate) {
    return __awaiter(this, void 0, void 0, function () {
        var listRelations, createdEntity;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, handleEntityRelationsPreCreate(entityName, entityToCreate)];
                case 1:
                    listRelations = _a.sent();
                    return [4 /*yield*/, model(entityName).create(entityToCreate)];
                case 2:
                    createdEntity = _a.sent();
                    return [4 /*yield*/, associateRelations(listRelations, createdEntity)];
                case 3:
                    _a.sent();
                    return [2 /*return*/, createdEntity.dataValues];
            }
        });
    });
}
function createManyEntities(entityName, entitiesToCreate) {
    return __awaiter(this, void 0, void 0, function () {
        var entityIdToListRelations, createdEntities;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    entitiesToCreate.forEach(function (entityToCreate) {
                        entityToCreate.id = cuid_1.default();
                    });
                    entityIdToListRelations = {};
                    return [4 /*yield*/, async_1.default.each(entitiesToCreate, function (entityToCreate) { return __awaiter(_this, void 0, void 0, function () {
                            var listRelations;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, handleEntityRelationsPreCreate(entityName, entityToCreate, CREATE_MANY)];
                                    case 1:
                                        listRelations = _a.sent();
                                        entityIdToListRelations[entityToCreate.id] = listRelations;
                                        return [2 /*return*/];
                                }
                            });
                        }); })];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, model(entityName).bulkCreate(entitiesToCreate)];
                case 2:
                    createdEntities = _a.sent();
                    return [4 /*yield*/, async_1.default.eachOf(createdEntities, function (createdEntity) { return __awaiter(_this, void 0, void 0, function () {
                            var listRelations;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        listRelations = entityIdToListRelations[createdEntity.id];
                                        return [4 /*yield*/, associateRelations(listRelations, createdEntity)];
                                    case 1:
                                        _a.sent();
                                        return [2 /*return*/];
                                }
                            });
                        }); })];
                case 3:
                    _a.sent();
                    return [2 /*return*/, createdEntities.map(function (createdEntity) { return createdEntity.dataValues; })];
            }
        });
    });
}
function updateEntity(entityName, data, where) {
    return __awaiter(this, void 0, void 0, function () {
        var listRelationsToAssociate, listRelationsToDisassociate, entity, updatedEntity;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    listRelationsToAssociate = [];
                    listRelationsToDisassociate = [];
                    return [4 /*yield*/, model(entityName).findOne({
                            where: where
                        })];
                case 1:
                    entity = _a.sent();
                    if (!entity) {
                        // TODO: throw error instead of returning null?
                        return [2 /*return*/, null];
                    }
                    return [4 /*yield*/, asyncEach(Object.keys(data), function (entityField) { return __awaiter(_this, void 0, void 0, function () {
                            var _a, _b, _c, _d, _e, _f;
                            return __generator(this, function (_g) {
                                switch (_g.label) {
                                    case 0:
                                        if (!(lodash_1.isObject(data[entityField]) && data[entityField].connect)) return [3 /*break*/, 2];
                                        _b = (_a = listRelationsToAssociate.push).apply;
                                        _c = [listRelationsToAssociate];
                                        return [4 /*yield*/, handleRelatedConnects(entityName, entityField, data)];
                                    case 1:
                                        _b.apply(_a, _c.concat([(_g.sent())]));
                                        _g.label = 2;
                                    case 2:
                                        if (!(lodash_1.isObject(data[entityField]) && data[entityField].disconnect)) return [3 /*break*/, 4];
                                        _e = (_d = listRelationsToDisassociate.push).apply;
                                        _f = [listRelationsToDisassociate];
                                        return [4 /*yield*/, handleRelatedDisconnects(entityName, entityField, data, entity)];
                                    case 3:
                                        _e.apply(_d, _f.concat([(_g.sent())]));
                                        _g.label = 4;
                                    case 4: return [2 /*return*/];
                                }
                            });
                        }); })];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, entity.update(data)];
                case 3:
                    updatedEntity = _a.sent();
                    return [4 /*yield*/, associateRelations(listRelationsToAssociate, updatedEntity)];
                case 4:
                    _a.sent();
                    return [4 /*yield*/, disassociateRelations(listRelationsToDisassociate, updatedEntity)];
                case 5:
                    _a.sent();
                    return [2 /*return*/, updatedEntity.dataValues];
            }
        });
    });
}
function updateManyEntities(entityName, data, where) {
    return __awaiter(this, void 0, void 0, function () {
        var entities, updatedEntities;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getAllEntitiesSqObjects({ where: where }, entityName)];
                case 1:
                    entities = _a.sent();
                    return [4 /*yield*/, asyncMap(entities, function (entity) { return __awaiter(_this, void 0, void 0, function () {
                            return __generator(this, function (_a) {
                                return [2 /*return*/, entity.update(data)];
                            });
                        }); })];
                case 2:
                    updatedEntities = _a.sent();
                    return [2 /*return*/, lodash_1.map(updatedEntities, 'dataValues')];
            }
        });
    });
}
function isListRelation(fieldInSchema) {
    var relationName = openCrudDataModel.types.find(function (entityType) { return entityType.name === fieldInSchema.relationName; });
    var isTableBasedRelation = relationName && relationName.directives.find(function (d) { return d.name === 'relationTable'; });
    return isTableBasedRelation || fieldInSchema.isList;
}
function handleRelatedConnects(entityName, entityField, entityToCreate) {
    return __awaiter(this, void 0, void 0, function () {
        var listRelations, entityTypeInSchema, fieldInSchema, pgRelationDirective, columnName, uniqueIdentifier, relatedEntity, relatedEntities;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    listRelations = [];
                    entityTypeInSchema = openCrudDataModel.types.find(function (entityType) { return entityType.name === lodash_1.upperFirst(entityName); });
                    fieldInSchema = entityTypeInSchema.fields.find(function (f) { return f.name === entityField; });
                    pgRelationDirective = fieldInSchema.directives.find(function (d) { return d.name === 'pgRelation'; });
                    if (!(pgRelationDirective && !fieldInSchema.isList)) return [3 /*break*/, 5];
                    columnName = pgRelationDirective.arguments.column;
                    uniqueIdentifier = Object.keys(entityToCreate[entityField].connect)[0];
                    if (!uniqueIdentifier) return [3 /*break*/, 4];
                    if (!(uniqueIdentifier === 'id')) return [3 /*break*/, 1];
                    entityToCreate[lodash_1.camelCase(columnName)] = entityToCreate[entityField].connect.id;
                    return [3 /*break*/, 3];
                case 1: return [4 /*yield*/, model(fieldInSchema.type.name).findOne({
                        where: __assign({}, entityToCreate[entityField].connect)
                    })];
                case 2:
                    relatedEntity = _b.sent();
                    entityToCreate[lodash_1.camelCase(columnName)] = relatedEntity.id;
                    _b.label = 3;
                case 3: return [3 /*break*/, 5];
                case 4: throw new ClientDataValidationError({
                    logLevel: WARN,
                    message: "Invalid argument in " + entityField + " parameter"
                });
                case 5:
                    if (!isListRelation(fieldInSchema)) return [3 /*break*/, 7];
                    return [4 /*yield*/, model(fieldInSchema.type.name).findAll({
                            where: (_a = {}, _a[Op.or] = entityToCreate[entityField].connect, _a)
                        })];
                case 6:
                    relatedEntities = _b.sent();
                    relatedEntities.forEach(function (relatedEntity) {
                        listRelations.push({ relatedEntityField: lodash_1.upperFirst(entityField), relatedEntityId: relatedEntity.id });
                    });
                    _b.label = 7;
                case 7: return [2 /*return*/, listRelations];
            }
        });
    });
}
function handleRelatedDisconnects(entityName, entityField, entity, entityInstance) {
    return __awaiter(this, void 0, void 0, function () {
        var listRelations, entityTypeInSchema, fieldInSchema, pgRelationDirective, columnName, disconnectArgValue, relatedEntities;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    listRelations = [];
                    entityTypeInSchema = openCrudDataModel.types.find(function (entityType) { return entityType.name === lodash_1.upperFirst(entityName); });
                    fieldInSchema = entityTypeInSchema.fields.find(function (f) { return f.name === entityField; });
                    pgRelationDirective = fieldInSchema.directives.find(function (d) { return d.name === 'pgRelation'; });
                    if (pgRelationDirective && !fieldInSchema.isList) {
                        columnName = pgRelationDirective.arguments.column;
                        entity[lodash_1.camelCase(columnName)] = null;
                    }
                    if (!isListRelation(fieldInSchema)) return [3 /*break*/, 5];
                    disconnectArgValue = entity[entityField].disconnect;
                    relatedEntities = void 0;
                    if (!(lodash_1.isObject(disconnectArgValue) || Array.isArray(disconnectArgValue))) return [3 /*break*/, 2];
                    return [4 /*yield*/, model(fieldInSchema.type.name).findAll({
                            where: (_a = {}, _a[Op.or] = disconnectArgValue, _a)
                        })];
                case 1:
                    relatedEntities = _b.sent();
                    return [3 /*break*/, 4];
                case 2: return [4 /*yield*/, entityInstance["get" + lodash_1.upperFirst(entityField)]()];
                case 3:
                    relatedEntities = _b.sent();
                    _b.label = 4;
                case 4:
                    relatedEntities.forEach(function (relatedEntity) {
                        listRelations.push({ relatedEntityField: lodash_1.upperFirst(entityField), relatedEntityId: relatedEntity.id });
                    });
                    _b.label = 5;
                case 5: return [2 /*return*/, listRelations];
            }
        });
    });
}
function associateRelations(listRelations, entity) {
    return __awaiter(this, void 0, void 0, function () {
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!listRelations.length) return [3 /*break*/, 2];
                    return [4 /*yield*/, asyncEach(listRelations, function (listRelation) { return __awaiter(_this, void 0, void 0, function () {
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, entity["add" + listRelation.relatedEntityField](listRelation.relatedEntityId)];
                                    case 1:
                                        _a.sent();
                                        return [2 /*return*/];
                                }
                            });
                        }); })];
                case 1:
                    _a.sent();
                    _a.label = 2;
                case 2: return [2 /*return*/];
            }
        });
    });
}
function disassociateRelations(listRelations, entity) {
    return __awaiter(this, void 0, void 0, function () {
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!listRelations.length) return [3 /*break*/, 2];
                    return [4 /*yield*/, asyncEach(listRelations, function (listRelation) { return __awaiter(_this, void 0, void 0, function () {
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, entity["remove" + listRelation.relatedEntityField](listRelation.relatedEntityId)];
                                    case 1:
                                        _a.sent();
                                        return [2 /*return*/];
                                }
                            });
                        }); })];
                case 1:
                    _a.sent();
                    _a.label = 2;
                case 2: return [2 /*return*/];
            }
        });
    });
}
function deleteEntity(entityName, where) {
    return __awaiter(this, void 0, void 0, function () {
        var entity;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, model(entityName).findOne({
                        where: where
                    })];
                case 1:
                    entity = _a.sent();
                    return [4 /*yield*/, entity.destroy()];
                case 2:
                    _a.sent();
                    return [2 /*return*/, entity.dataValues];
            }
        });
    });
}
function deleteManyEntities(entityName, where) {
    return __awaiter(this, void 0, void 0, function () {
        var entities;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getAllEntitiesSqObjects({ where: where }, entityName)];
                case 1:
                    entities = _a.sent();
                    return [4 /*yield*/, asyncEach(entities, function (entity) { return __awaiter(_this, void 0, void 0, function () {
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, entity.destroy()];
                                    case 1:
                                        _a.sent();
                                        return [2 /*return*/];
                                }
                            });
                        }); })];
                case 2:
                    _a.sent();
                    return [2 /*return*/, lodash_1.map(entities, 'dataValues')];
            }
        });
    });
}
function getEntitiesConnection(entityName, args) {
    return __awaiter(this, void 0, void 0, function () {
        var sqFilter, entityCount;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    sqFilter = args && graphql_transformers_1.openCrudToSequelize(args, lodash_1.upperFirst(entityName));
                    return [4 /*yield*/, model(entityName).count(sqFilter)];
                case 1:
                    entityCount = _a.sent();
                    return [2 /*return*/, {
                            aggregate: {
                                count: entityCount,
                                __typename: "Aggregate" + lodash_1.upperFirst(entityName)
                            },
                            __typename: lodash_1.upperFirst(entityName) + "Connection",
                            pageInfo: {
                                startCursor: null // TODO: do we need support it?
                            }
                        }];
            }
        });
    });
}
function handleEntityRelationsPreCreate(entityName, entityToCreate, isCreateMany) {
    if (isCreateMany === void 0) { isCreateMany = false; }
    return __awaiter(this, void 0, void 0, function () {
        var listRelations;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    listRelations = [];
                    return [4 /*yield*/, async_1.default.each(Object.keys(entityToCreate), function (entityField) { return __awaiter(_this, void 0, void 0, function () {
                            var _a, _b, _c;
                            return __generator(this, function (_d) {
                                switch (_d.label) {
                                    case 0:
                                        if (!lodash_1.isObject(entityToCreate[entityField])) return [3 /*break*/, 2];
                                        if (isCreateMany && entityToCreate[entityField].create) {
                                            // In order to enable this need to verify that nested mutations work correctly with the bulk create scenario
                                            throw new ServerDataValidationError({ message: 'Nested create of entities inside of createMany is not currently supported' });
                                        }
                                        if (!entityToCreate[entityField].connect) return [3 /*break*/, 2];
                                        _b = (_a = listRelations.push).apply;
                                        _c = [listRelations];
                                        return [4 /*yield*/, handleRelatedConnects(entityName, entityField, entityToCreate)];
                                    case 1:
                                        _b.apply(_a, _c.concat([(_d.sent())]));
                                        _d.label = 2;
                                    case 2: return [2 /*return*/];
                                }
                            });
                        }); })];
                case 1:
                    _a.sent();
                    return [2 /*return*/, listRelations];
            }
        });
    });
}
function model(entityName) {
    return sequelize_model_1.sq[entityName] || sequelize_model_1.sq[lodash_1.upperFirst(entityName)];
}
exports.default = {
    getEntity: getEntity,
    getAllEntities: getAllEntities,
    getRelatedEntityId: getRelatedEntityId,
    getRelatedEntity: getRelatedEntity,
    getRelatedEntityIds: getRelatedEntityIds,
    getRelatedEntities: getRelatedEntities,
    createEntity: createEntity,
    createManyEntities: createManyEntities,
    updateEntity: updateEntity,
    updateManyEntities: updateManyEntities,
    deleteEntity: deleteEntity,
    deleteManyEntities: deleteManyEntities,
    getEntitiesConnection: getEntitiesConnection
};
//# sourceMappingURL=sequelizeDataProvider.js.map