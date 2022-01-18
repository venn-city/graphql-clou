import Sequelize from 'sequelize';
import cuid from 'cuid';
import _ from 'lodash';
import { openCrudDataModel } from '@venncity/opencrud-schema-provider';

const entityTypesSchema = openCrudDataModel.types;

// eslint-disable-next-line import/prefer-default-export
export const hookDefinitions = {
  beforeCreate(entity) {
    entity.id = cuid();
  },
  beforeBulkCreate(entities) {
    entities.forEach(entity => {
      if (!entity.id) {
        entity.id = cuid();
      }
    });
  },
  // this is used here and in other hooks as this is the only was to infer the entity name for which the hook is called.
  beforeValidate(entityInput) {
    // @ts-ignore
    runSchemaBasedHooks(entityInput, [jsonToString], this.name);
  },
  afterFind(entityInput) {
    // @ts-ignore
    runSchemaBasedHooks(entityInput, [stringToJson, formatFloat, convertNullToEmptyArray, formatDate], this.name);
  },
  afterCreate(entityInput) {
    // @ts-ignore
    runSchemaBasedHooks(entityInput, [stringToJson, formatFloat, convertNullToEmptyArray, formatDate], this.name);
  },
  afterUpdate(entityInput) {
    // @ts-ignore
    runSchemaBasedHooks(entityInput, [stringToJson, formatFloat, convertNullToEmptyArray, formatDate], this.name);
  }
};

function runSchemaBasedHooks(entityInput, hooks, entityName) {
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

    const entityTypeInSchema = entityTypesSchema.find(entityType => entityType.name === entityName);
    entity.dataValues = _.mapValues(entity.dataValues, (fieldValue, fieldName) => {
      const fieldInSchema = entityTypeInSchema?.fields?.find(field => field.name === fieldName);

      let returnValue = fieldValue;

      if (fieldInSchema) {
        if (Array.isArray(fieldValue)) {
          handleRelatedEntityArray(fieldValue, hooks, fieldInSchema.type.name);
        } else if (fieldValue instanceof Sequelize.Model) {
          runSchemaBasedHooks(fieldValue, hooks, fieldInSchema.type.name);
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

function handleRelatedEntityArray(fieldValues, hooks, entityName) {
  fieldValues.forEach(fieldValue => {
    if (fieldValue instanceof Sequelize.Model) {
      runSchemaBasedHooks(fieldValue, hooks, entityName);
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
