"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.hookDefinitions = void 0;
var sequelize_1 = __importDefault(require("@venncity/sequelize"));
var cuid_1 = __importDefault(require("cuid"));
var lodash_1 = __importDefault(require("lodash"));
var opencrud_schema_provider_1 = require("@venncity/opencrud-schema-provider");
var entityTypesSchema = opencrud_schema_provider_1.openCrudDataModel.types;
// eslint-disable-next-line import/prefer-default-export
exports.hookDefinitions = {
    beforeCreate: function (entity) {
        entity.id = cuid_1.default();
    },
    beforeBulkCreate: function (entities) {
        entities.forEach(function (entity) {
            if (!entity.id) {
                entity.id = cuid_1.default();
            }
        });
    },
    beforeValidate: function (entityInput) {
        runSchemaBasedHooks(entityInput, [jsonToString]);
    },
    afterFind: function (entityInput) {
        runSchemaBasedHooks(entityInput, [stringToJson, formatFloat, convertNullToEmptyArray, formatDate]);
    },
    afterCreate: function (entityInput) {
        runSchemaBasedHooks(entityInput, [stringToJson, formatFloat, convertNullToEmptyArray, formatDate]);
    },
    afterUpdate: function (entityInput) {
        runSchemaBasedHooks(entityInput, [stringToJson, formatFloat, convertNullToEmptyArray, formatDate]);
    }
};
function runSchemaBasedHooks(entityInput, hooks) {
    if (!entityInput) {
        return;
    }
    var entities = lodash_1.default.isArray(entityInput) ? entityInput : [entityInput];
    entities.forEach(function (entity) {
        if (!entity) {
            return;
        }
        if (!entity.dataValues.deleted) {
            entity.dataValues.deleted = 0;
        }
        // eslint-disable-next-line no-underscore-dangle
        var entityName = entity._modelOptions.name.singular;
        var entityTypeInSchema = entityTypesSchema.find(function (entityType) { return entityType.name === entityName; });
        entity.dataValues = lodash_1.default.mapValues(entity.dataValues, function (fieldValue, fieldName) {
            var fieldInSchema = entityTypeInSchema.fields.find(function (field) { return field.name === fieldName; });
            var returnValue = fieldValue;
            if (fieldInSchema) {
                if (Array.isArray(fieldValue)) {
                    handleRelatedEntityArray(fieldValue, hooks);
                }
                else if (fieldValue instanceof sequelize_1.default.Model) {
                    runSchemaBasedHooks(fieldValue, hooks);
                }
                else {
                    hooks.forEach(function (hook) {
                        returnValue = hook(fieldInSchema, returnValue);
                    });
                }
            }
            return returnValue;
        });
    });
}
function handleRelatedEntityArray(fieldValues, hooks) {
    fieldValues.forEach(function (fieldValue) {
        if (fieldValue instanceof sequelize_1.default.Model) {
            runSchemaBasedHooks(fieldValue, hooks);
        }
    });
}
function jsonToString(fieldInSchema, v) {
    if (fieldInSchema.type === 'Json' && lodash_1.default.isObject(v)) {
        return JSON.stringify(v);
    }
    return v;
}
function stringToJson(fieldInSchema, v) {
    if (fieldInSchema.type === 'Json' && lodash_1.default.isString(v)) {
        return JSON.parse(v);
    }
    return v;
}
function formatFloat(fieldInSchema, v) {
    if (fieldInSchema.type === 'Float' && v) {
        return Number(v);
    }
    return v;
}
function formatDate(fieldInSchema, v) {
    if (v && fieldInSchema.type === 'DateTime') {
        return lodash_1.default.isDate(v) ? v.toISOString() : new Date(v).toISOString();
    }
    return v;
}
function convertNullToEmptyArray(fieldInSchema, v) {
    if (fieldInSchema.isList) {
        return v === null ? [] : v;
    }
    return v;
}
//# sourceMappingURL=hooks.js.map