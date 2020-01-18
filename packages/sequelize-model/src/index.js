const sq = require('./sequelizeInit');
const { baseModel } = require('./base/baseModel');
const { getCommonDbColumnDefinitions } = require('./commonColumnDefintions');

module.exports = {
  sq,
  baseModel,
  getCommonDbColumnDefinitions
};
