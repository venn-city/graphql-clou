const { transformComputedFieldsWhereArguments } = require('./computedFieldsWhereTrasform/computedFieldsWhereTransformation');
const { openCrudToSequelize } = require('./openCrudWhereTransform/openCRUDtoSequelizeWhereTransformer');
const sequelizeConsts = require('./openCrudWhereTransform/sequelizeConsts');
const resultLimiter = require('./resultLimiter/resultLimiter');

module.exports = {
  transformComputedFieldsWhereArguments,
  openCrudToSequelize,
  sequelizeConsts,
  resultLimiter
};
