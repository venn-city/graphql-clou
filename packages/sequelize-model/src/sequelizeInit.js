const fs = require('fs');
const _ = require('lodash');
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
  schema: config.get('db.schema'),
  dialect: config.get('sequelize.dialect'),
  logging: () => loggingEnabled,
  define: {
    hooks: {
      beforeCreate: entity => {
        entity.id = cuid();
      },
      beforeValidate: entityInput => {
        runSchemaBasedHooks(entityInput, [jsonToString]);
      },
      afterFind: entityInput => {
        runSchemaBasedHooks(entityInput, [stringToJson, formatFloat]);
      },
      afterCreate: entityInput => {
        runSchemaBasedHooks(entityInput, [stringToJson, formatFloat]);
      },
      afterUpdate: entityInput => {
        runSchemaBasedHooks(entityInput, [stringToJson, formatFloat]);
      }
    }
  }
});

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
    // eslint-disable-next-line no-underscore-dangle
    const entityName = entity._modelOptions.name.singular;
    const entityTypeInSchema = entityTypesSchema.find(entityType => entityType.name === entityName);
    entity.dataValues = _.mapValues(entity.dataValues, (v, k) => {
      const fieldInSchema = entityTypeInSchema.fields.find(f => f.name === k);
      let returnValue = v;
      if (fieldInSchema) {
        hooks.forEach(hook => {
          returnValue = hook(fieldInSchema, returnValue);
        });
      }
      return returnValue;
    });
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

module.exports = sq;
