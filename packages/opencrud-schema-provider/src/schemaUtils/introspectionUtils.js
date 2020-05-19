/* eslint-disable consistent-return */
const { upperFirst, get } = require('lodash');

const TYPE = '__Type';
const FIELD = '__Field';

const KINDS = {
  SCALAR: 'SCALAR',
  ENUM: 'ENUM',
  LIST: 'LIST',
  OBJECT: 'OBJECT',
  NON_NULL: 'NON_NULL'
};

function getQueryWhereInputName(context, fieldName) {
  const whereInputType = context.openCrudIntrospection.types
    .find(t => t.name === 'Query')
    .fields.find(f => f.name === fieldName)
    .args.find(a => a.name === 'where').type;
  return whereInputType.name || whereInputType.ofType.name;
}

function getMutationWhereInputName(context, fieldName) {
  const whereInputType = context.openCrudIntrospection.types
    .find(t => t.name === 'Mutation')
    .fields.find(f => f.name === fieldName)
    .args.find(a => a.name === 'where').type;
  return whereInputType.name || whereInputType.ofType.name;
}

// e.g. SCALAR / OBJECT / LIST / ENUM / ...
function getFieldKind(field) {
  switch (calcType(field)) {
    case TYPE:
      return field.kind;
    case FIELD:
      return (field.type.kind === KINDS.LIST && KINDS.LIST) || (field.type.ofType && field.type.ofType.kind) || field.type.kind;
    default:
      /* istanbul ignore next */
      throwError(field);
  }
}

function calcType(field) {
  return field.name === upperFirst(field.name) ? TYPE : FIELD;
}

// e.g. String / PaymentRequest / Member / ...
function getFieldType(field) {
  switch (calcType(field)) {
    case TYPE:
      return field.name;
    case FIELD:
      return getTypeForField(field);
    default:
      /* istanbul ignore next */
      throwError(field);
  }
}

function getTypeForField(field) {
  if (get(field, 'type.kind') === KINDS.LIST || get(field, 'type.kind') === KINDS.NON_NULL) {
    return (
      get(field, 'type.ofType.ofType.ofType.name')
      || get(field, 'type.ofType.ofType.name')
      || get(field, 'type.ofType.name')
    );
  }
  return (
    get(field, 'type.name')
  || get(field, 'type.ofType.name')
  || get(field, 'type.ofType.ofType.name')
  );
}

// e.g. firstName / member / leaseContracts / ...
function getFieldName(field) {
  switch (calcType(field)) {
    case TYPE:
      return field.name;
    case FIELD:
      return field.name;
    default:
      /* istanbul ignore next */
      throwError(field);
  }
}

function extractFieldMetadata(field) {
  const fieldName = getFieldName(field);
  const fieldKind = getFieldKind(field);
  const fieldType = getFieldType(field);
  return { fieldName, fieldKind, fieldType };
}

/* istanbul ignore next */
function throwError(field) {
  throw new Error(`unexpected field __typename: ${JSON.stringify(field)}`);
}

function getChildFieldsMetadata(field, introspection) {
  const fieldType = getFieldType(field);
  if (!fieldType) {
    return [];
  }
  const resourceType = findTypeInIntrospection(introspection, fieldType);
  return resourceType.fields;
}

/* istanbul ignore next */
function verifyExactlyOneFieldOfTypeOnEntity(childFieldsOfTypeCount, childType, field) {
  if (childFieldsOfTypeCount === 0) {
    throw new Error(`Couldn't find field of type ${childType} on ${getFieldName(field)}`);
  }
  if (childFieldsOfTypeCount > 1) {
    throw new Error(
      `Found unexpected multiple fields of type ${childType} on ${getFieldName(field)}, currently only a single field of each type is supported`
    );
  }
}

function getChildFieldOfType(field, childType, introspection) {
  const childFieldsOfType = getChildFieldsMetadata(field, introspection).filter(childField => getFieldType(childField) === childType);
  verifyExactlyOneFieldOfTypeOnEntity(childFieldsOfType.length, childType, field);
  return childFieldsOfType[0];
}

function findTypeInIntrospection(introspection, resource) {
  return introspection.types.find(t => {
    return t.name === resource;
  });
}

module.exports = {
  getMutationWhereInputName,
  getQueryWhereInputName,
  findTypeInIntrospection,
  getChildFields: getChildFieldsMetadata,
  getChildFieldOfType,
  getFieldName,
  getFieldKind,
  getFieldType,
  extractFieldMetadata,
  KINDS
};
