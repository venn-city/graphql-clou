const xray = require('aws-xray-sdk');
const Sequelize = require('sequelize');
const { forOwn } = require('lodash');
const DataTypes = require('sequelize/lib/data-types');
const config = require('@venncity/nested-config')(__dirname);
let pg = require('pg');
const { hookDefinitions } = require('./hooks/hooks');

delete pg.native; // A module of pg.native is being required even though native:false, https://github.com/sequelize/sequelize/issues/3781#issuecomment-104278869
if (config.get('xray.enabled').toString() === 'true') {
  Sequelize.useCLS(xray.getNamespace());
  pg = xray.capturePostgres(pg);
}

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
  },
  retry: getRetryConfig()
});

function getRetryConfig() {
  return {
    // config according to retry-as-promised (https://github.com/mickhansen/retry-as-promised)
    max: 4,
    timeout: 10000,
    match: [Sequelize.ConnectionError],
    backoffBase: 12, // ms
    backoffExponent: 2,
    report: (message, conf) => {
      if (conf.$current > 1) {
        console.warn('Retrying sequelize operation', message, 'attempt:', conf.$current);
      }
    },
    name: 'sq-connection-error-retry'
  };
}

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
