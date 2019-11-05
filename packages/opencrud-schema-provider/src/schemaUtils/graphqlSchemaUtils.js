const {
  GraphQLObjectType,
  GraphQLScalarType,
  GraphQLInterfaceType,
  GraphQLUnionType,
  GraphQLList,
  GraphQLEnumType,
  GraphQLNonNull
} = require('graphql');
const { upperFirst } = require('lodash');

const SCALAR_TYPES = [GraphQLScalarType, GraphQLEnumType];
const NON_SCALAR_TYPES = [GraphQLObjectType, GraphQLInterfaceType, GraphQLUnionType, GraphQLList];

function isScalar(fieldType) {
  if (SCALAR_TYPES.some(scalarType => fieldType instanceof scalarType)) {
    return true;
  }
  if (fieldType instanceof GraphQLNonNull) {
    return isScalar(fieldType.ofType);
  }
  return !NON_SCALAR_TYPES.some(scalarType => fieldType instanceof scalarType);
}

function isObject(fieldType) {
  if (fieldType instanceof GraphQLObjectType) {
    return true;
  }
  if (fieldType instanceof GraphQLNonNull) {
    return isObject(fieldType.ofType);
  }
  return false;
}

function isList(fieldType) {
  if (fieldType instanceof GraphQLList) {
    return true;
  }
  if (fieldType instanceof GraphQLNonNull) {
    return isList(fieldType.ofType);
  }
  return false;
}

function getField(schema, entityName, fieldName) {
  return Object.values(schema.getType(upperFirst(entityName)).getFields()).find(f => f.name === fieldName.split('_')[0]);
}

function getFieldType(schema, entityName, fieldName) {
  const relatedType = getField(schema, entityName, fieldName);
  return relatedType.type.name || relatedType.type.ofType.name || relatedType.type.ofType.ofType.name;
}

module.exports = {
  isScalar,
  isObject,
  isList,
  getField,
  getFieldType
};
