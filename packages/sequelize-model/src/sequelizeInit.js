"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var sequelize_1 = __importDefault(require("@venncity/sequelize"));
var lodash_1 = require("lodash");
var cls_hooked_1 = __importDefault(require("cls-hooked"));
var data_types_1 = __importDefault(require("@venncity/sequelize/lib/data-types"));
var clou_utils_1 = require("@venncity/clou-utils");
var config = require('@venncity/nested-config')(__dirname);
var pg = require('pg');
// eslint-disable-next-line import/order,import/first
var hooks_1 = require("./hooks/hooks");
delete pg.native; // A module of pg.native is being required even though native:false, https://github.com/sequelize/sequelize/issues/3781#issuecomment-104278869
/* istanbul ignore next */
if (process.env.IS_TEST !== 'true') {
    if (clou_utils_1.isTrue(config.get('xray.enabled'))) {
        // eslint-disable-next-line global-require
        var xray = require('aws-xray-sdk');
        sequelize_1.default.useCLS(xray.getNamespace());
        pg = xray.capturePostgres(pg);
    }
    else if (process.env.CLS_ENABLED === 'true') {
        var namespace = cls_hooked_1.default.createNamespace(config.get('clsNamespace.name'));
        sequelize_1.default.useCLS(namespace);
    }
}
var enableLogging = clou_utils_1.isTrue(config.get('sequelize.logging'));
var sq = {};
var sequelize = new sequelize_1.default(config.get('db.name'), config.get('db.user'), config.get('db.password'), {
    host: config.get('db.host'),
    pool: getPoolConfig(),
    port: config.has('db.port') ? config.get('db.port') : 5432,
    schema: config.get('db.schema'),
    dialect: config.get('sequelize.dialect'),
    dialectModule: pg,
    logging: function (query, metadata) {
        if (enableLogging) {
            console.info(query);
            console.debug(metadata);
        }
    },
    native: undefined,
    dialectOptions: {
        useUTC: true
    },
    define: {
        hooks: hooks_1.hookDefinitions
    },
    retry: getRetryConfig()
});
function getRetryConfig() {
    return {
        // config according to retry-as-promised (https://github.com/mickhansen/retry-as-promised)
        max: 4,
        timeout: config.get('sequelize.retry.timeout'),
        match: [sequelize_1.default.ConnectionError, /Connection terminated unexpectedly/],
        backoffBase: 12,
        backoffExponent: 2,
        report: function (message, conf) {
            if (conf.$current > 1) {
                console.warn('Retrying sequelize operation', message, 'attempt:', conf.$current);
            }
        },
        name: 'sq-connection-error-retry'
    };
}
function getPoolConfig() {
    var poolConfig = config.get('sequelize.pool');
    Object.entries(poolConfig).forEach(function (_a) {
        var key = _a[0], value = _a[1];
        poolConfig[key] = Number(value);
    });
    return poolConfig;
}
function init(models) {
    if (sq.initialized) {
        console.log('Sequelize already initialized, skipping');
        return sq;
    }
    lodash_1.forOwn(models, function (model, modelName) {
        sq[modelName] = model(sequelize, data_types_1.default);
    });
    lodash_1.forOwn(models, function (model, modelName) {
        if (sq[modelName].associate) {
            sq[modelName].associate(sq);
        }
    });
    sq.initialized = true;
    return sq;
}
sq.sequelize = sequelize;
sq.Sequelize = sequelize_1.default;
sq.init = init;
exports.default = sq;
//# sourceMappingURL=sequelizeInit.js.map