const Sequelize = require('@venncity/sequelize');
const cuid = require('cuid');
const _ = require('lodash');
const { openCrudDataModel } = require('@venncity/opencrud-schema-provider');

const entityTypesSchema = openCrudDataModel.types;

const hookDefinitions = {
  beforeCreate: entity => {
    entity.id = cuid();
  },
  beforeValidate: entityInput => {
    runSchemaBasedHooks(entityInput, [jsonToString]);
  },
  afterFind: entityInput => {
    runSchemaBasedHooks(entityInput, [stringToJson, formatFloat, convertNullToEmptyArray, formatDate]);
  },
  afterCreate: entityInput => {
    runSchemaBasedHooks(entityInput, [stringToJson, formatFloat, convertNullToEmptyArray, formatDate]);
  },
  afterUpdate: entityInput => {
    runSchemaBasedHooks(entityInput, [stringToJson, formatFloat, convertNullToEmptyArray, formatDate]);
  }
};

function runSchemaBasedHooks(entityInput, hooks) {
  if (!entityInput) {
    return;
  }

  const entities = _.isArray(entityInput) ? entityInput : [entityInput];
  entities.forEach(entity => {
    if (!entity) {
      return;
    }

    if (!entity.dataValues.deleted) {
      entity.dataValues.deleted = 0;
    }

    // eslint-disable-next-line no-underscore-dangle
    const entityName = entity._modelOptions.name.singular;
    const entityTypeInSchema = entityTypesSchema.find(entityType => entityType.name === entityName);
    entity.dataValues = _.mapValues(entity.dataValues, (fieldValue, fieldName) => {
      const fieldInSchema = entityTypeInSchema.fields.find(field => field.name === fieldName);

      let returnValue = fieldValue;

      if (fieldInSchema) {
        if (Array.isArray(fieldValue)) {
          handleRelatedEntityArray(fieldValue, hooks);
        } else if (fieldValue instanceof Sequelize.Model) {
          runSchemaBasedHooks(fieldValue, hooks);
        } else {
          hooks.forEach(hook => {
            returnValue = hook(fieldInSchema, returnValue);
          });
        }
      }
      return returnValue;
    });
  });
}

function handleRelatedEntityArray(fieldValues, hooks) {
  fieldValues.forEach(fieldValue => {
    if (fieldValue instanceof Sequelize.Model) {
      runSchemaBasedHooks(fieldValue, hooks);
    }
  });
}

function jsonToString(fieldInSchema, v) {
  if (fieldInSchema.type === 'Json' && _.isObject(v)) {
    return JSON.stringify(v);
  }
  return v;
}

function stringToJson(fieldInSchema, v) {
  if (fieldInSchema.type === 'Json' && _.isString(v)) {
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
    return _.isDate(v) ? v.toISOString() : new Date(v).toISOString();
  }
  return v;
}

function convertNullToEmptyArray(fieldInSchema, v) {
  if (fieldInSchema.isList) {
    return v === null ? [] : v;
  }
  return v;
}

module.exports = {
  hookDefinitions
};
