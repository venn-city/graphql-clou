const { transformComputedFieldsWhereArguments } = require('./computedFieldsWhereTrasform/computedFieldsWhereTransformation');
const { openCrudToSequelize } = require('./openCrudWhereTransform/openCRUDtoSequelizeWhereTransformer');

module.exports = {
  transformComputedFieldsWhereArguments,
  openCrudToSequelize
};
