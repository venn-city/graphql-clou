const _ = require('lodash');
const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const cuid = require('cuid');
const config = require('@venncity/nested-config')(__dirname);

const { openCrudDataModel } = require('@venncity/opencrud-schema-provider');

const sq = {};

const entityTypesSchema = openCrudDataModel.types;
const schemaPath = config.has('sequelize.schemaPath')
  ? path.join(process.cwd(), config.get('sequelize.schemaPath'))
  : path.join(__dirname, '../test/schema');
const loggingEnabled = config.get('sequelize.logging') === 'true';
const sequelize = new Sequelize(config.get('db.name'), config.get('db.user'), config.get('db.password'), {
  host: config.get('db.host'),
  pool: getPoolConfig(),
  port: config.has('db.port') ? config.get('db.port') : 5432,
  schema: config.get('db.schema'),
  dialect: config.get('sequelize.dialect'),
  logging: loggingEnabled || undefined,
  dialectOptions: {
    useUTC: true
  },
  define: {
    hooks: {
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
    }
  }
});

function getPoolConfig() {
  const poolConfig = config.get('sequelize.pool');
  Object.entries(poolConfig).forEach(([key, value]) => {
    poolConfig[key] = Number(value);
  });
  return poolConfig;
}

const readModelFiles = dir =>
  fs.readdirSync(dir).reduce((files, file) => {
    const name = path.join(dir, file);
    const isDirectory = fs.statSync(name).isDirectory();
    return isDirectory ? [...files, ...readModelFiles(name)] : addModelFile(files, name);
  }, []);

function addModelFile(files, name) {
  if (name.endsWith('-model.js')) {
    return [...files, name];
  }
  return files;
}

const modelFilenames = readModelFiles(schemaPath);
modelFilenames.forEach(file => {
  const model = sequelize.import(file);
  sq[model.name] = model;
});

Object.keys(sq).forEach(modelName => {
  if (sq[modelName].associate) {
    sq[modelName].associate(sq);
  }
});

sq.sequelize = sequelize;
sq.Sequelize = Sequelize;

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
  if (fieldInSchema.type === 'Float') {
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

module.exports = sq;
