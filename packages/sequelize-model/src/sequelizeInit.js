const Sequelize = require('sequelize');
const { forOwn } = require('lodash');
const pg = require('pg');

delete pg.native;

const DataTypes = require('sequelize/lib/data-types');
const config = require('@venncity/nested-config')(__dirname);
const { hookDefinitions } = require('./hooks/hooks');

const sq = {};

const loggingEnabled = config.get('sequelize.logging') === 'true';

const sequelize = new Sequelize(config.get('db.name'), config.get('db.user'), config.get('db.password'), {
  host: config.get('db.host'),
  pool: getPoolConfig(),
  port: config.has('db.port') ? config.get('db.port') : 5432,
  schema: config.get('db.schema'),
  dialect: config.get('sequelize.dialect'),
  dialectModule: pg,
  logging: loggingEnabled || undefined,
  native: undefined,
  dialectOptions: {
    useUTC: true
  },
  define: {
    hooks: hookDefinitions
  }
});

function getPoolConfig() {
  const poolConfig = config.get('sequelize.pool');
  Object.entries(poolConfig).forEach(([key, value]) => {
    poolConfig[key] = Number(value);
  });
  return poolConfig;
}

function init(models) {
  forOwn(models, (model, modelName) => {
    sq[modelName] = model(sequelize, DataTypes);
  });
  forOwn(models, (model, modelName) => {
    if (sq[modelName].associate) {
      sq[modelName].associate(sq);
    }
  });
  return sq;
}

sq.sequelize = sequelize;
sq.Sequelize = Sequelize;
sq.init = init;

module.exports = sq;
