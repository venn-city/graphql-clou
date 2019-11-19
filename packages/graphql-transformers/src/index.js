const { transformComputedFieldsWhereArguments } = require('./computedFieldsWhereTrasform/computedFieldsWhereTransformation');
const { openCrudToSequelize } = require('./openCrudWhereTransform/openCRUDtoSequelizeWhereTransformer');
const sequelizeConsts = require('./openCrudWhereTransform/sequelizeConsts');

module.exports = {
  transformComputedFieldsWhereArguments,
  openCrudToSequelize,
  sequelizeConsts
};
