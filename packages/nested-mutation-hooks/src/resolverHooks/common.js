const { get, keys } = require('lodash');
const { findTypeInIntrospection, getChildFields, getFieldName } = require('@venncity/opencrud-schema-provider').introspectionUtils;

function getChildEntityCreateResolver(context, fieldType) {
  return context.resolvers.Mutation[`create${fieldType}`];
}

function getChildEntityUpdateResolver(context, fieldType) {
  return context.resolvers.Mutation[`update${fieldType}`];
}

function getChildEntityDeleteResolver(context, fieldType) {
  return context.resolvers.Mutation[`delete${fieldType}`];
}

function detectChildFieldsToChange(context, resource, data) {
  const introspection = context.openCrudIntrospection;
  const parentEntityMetadata = findTypeInIntrospection(introspection, resource);
  const childFieldsMetadata = getChildFields(parentEntityMetadata, introspection);
  const childFieldsToChangeMetadata = childFieldsMetadata.filter(childField => keys(data).includes(getFieldName(childField)));
  return { parentEntityMetadata, childFieldsToChangeMetadata };
}

function isReferencingSideOfJoin(context, type, field) {
  const fieldMetadata = context.openCrudDataModel.types.find(t => t.name === type).fields.find(f => f.name === getFieldName(field));

  const isUsingRelationTable = !!fieldMetadata.relationName;
  if (isUsingRelationTable) {
    // When using a relation table there is no real "owner" of the join so we choose one arbitrarily
    return type < field.name;
  }
  const pgRelationDirective = fieldMetadata.directives.find(d => d.name === 'pgRelation');
  return get(pgRelationDirective, 'arguments.column') !== undefined;
}

module.exports = {
  getChildEntityCreateResolver,
  getChildEntityUpdateResolver,
  getChildEntityDeleteResolver,
  detectChildFieldsToChange,
  isReferencingSideOfJoin
};
