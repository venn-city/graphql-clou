import { GraphQLObjectType, GraphQLScalarType, GraphQLInterfaceType, GraphQLUnionType, GraphQLList, GraphQLEnumType, GraphQLNonNull } from 'graphql';
import { upperFirst } from 'lodash';

const SCALAR_TYPES = [GraphQLScalarType, GraphQLEnumType];
const NON_SCALAR_TYPES = [GraphQLObjectType, GraphQLInterfaceType, GraphQLUnionType, GraphQLList];

export function isScalar(fieldType: any) {
  if (SCALAR_TYPES.some(scalarType => fieldType instanceof scalarType)) {
    return true;
  }
  if (fieldType instanceof GraphQLNonNull) {
    return isScalar(fieldType.ofType);
  }
  return !NON_SCALAR_TYPES.some(scalarType => fieldType instanceof scalarType);
}

// @ts-ignore
export function isObject(fieldType) {
  if (fieldType instanceof GraphQLObjectType) {
    return true;
  }
  if (fieldType instanceof GraphQLNonNull) {
    return isObject(fieldType.ofType);
  }
  return false;
}

export function isList(fieldType) {
  if (fieldType instanceof GraphQLList) {
    return true;
  }
  if (fieldType instanceof GraphQLNonNull) {
    return isList(fieldType.ofType);
  }
  return false;
}

export function getField(schema, entityName, fieldName) {
  return Object.values(schema.getType(upperFirst(entityName)).getFields()).find((f: any) => f.name === fieldName.split('_')[0]);
}

export function getFieldType(schema, entityName, fieldName) {
  const relatedType: any = getField(schema, entityName, fieldName);
  return relatedType.type.name || relatedType.type.ofType.name || relatedType.type.ofType.ofType.name;
}

export default {
  isScalar,
  isObject,
  isList,
  getField,
  getFieldType
};
