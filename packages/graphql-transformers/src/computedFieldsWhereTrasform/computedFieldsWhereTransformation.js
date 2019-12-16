const { replace, cloneDeep, lowerFirst } = require('lodash');
const { getOpenCrudIntrospection, introspectionUtils } = require('@venncity/opencrud-schema-provider');

const openCrudIntrospection = getOpenCrudIntrospection();

function transformComputedFieldsWhereArguments({ originalWhere, whereInputName, computedWhereArgumentsTransformation, context, initialCall = true }) {
  let transformedWhere = cloneIfRequired(initialCall, originalWhere);
  if (originalWhere) {
    if (computedWhereArgumentsTransformation) {
      transformedWhere = replaceTopLevelWhereFields(computedWhereArgumentsTransformation, transformedWhere, whereInputName, context);
    }
    const whereInputObjectFields = getWhereInputObjectFields(whereInputName);
    const entityType = getEntityTypeFromWhereInput(whereInputName);
    replaceWhereNestedObjectFields(whereInputObjectFields, transformedWhere, entityType, context);
  }
  return transformedWhere;
}

function cloneIfRequired(initialCall, originalWhere) {
  // We don't want to mutate the original where as it may serve multiple queries on a single request!
  //
  // However, for each where, we *do* want to keep the same instance between recursive calls of transformComputedFieldsWhereArguments,
  //  as it needs to replace and delete fields on the original where.
  return initialCall ? cloneDeep(originalWhere) : originalWhere;
}

function replaceTopLevelWhereFields(computedWhereArgumentsTransformation, transformedWhere, whereInputName, context) {
  replaceBooleanOperators(transformedWhere, whereInputName, computedWhereArgumentsTransformation, context);
  Object.keys(computedWhereArgumentsTransformation).forEach(originalWhereArgumentName => {
    const transformationFunction = computedWhereArgumentsTransformation[originalWhereArgumentName];
    const originalWhereValue = transformedWhere[originalWhereArgumentName];
    if (originalWhereValue !== undefined) {
      const transformedWhereArgument = transformationFunction(originalWhereValue);
      delete transformedWhere[originalWhereArgumentName];
      transformedWhere = {
        ...transformedWhere,
        ...transformedWhereArgument
      };
    }
  });
  return transformedWhere;
}

function replaceBooleanOperators(transformedWhere, whereInputName, computedWhereArgumentsTransformation, context) {
  const booleanOperators = ['AND', 'OR', 'NOT'];
  booleanOperators.forEach(operator => {
    if (transformedWhere[operator]) {
      transformedWhere[operator] = transformedWhere[operator].map(whereElementWithinBooleanOperator => {
        const transformedWhereArg = transformComputedFieldsWhereArguments({
          originalWhere: whereElementWithinBooleanOperator,
          whereInputName,
          computedWhereArgumentsTransformation,
          context,
          initialCall: false
        });
        return transformedWhereArg;
      });
    }
  });
}

function convertWhereArgumentToFieldName(objectFieldName) {
  const listFieldWhereModifiers = /(_none$|_some$|_every$)/;
  return replace(objectFieldName, listFieldWhereModifiers, '');
}

function replaceWhereNestedObjectFields(whereInputObjectFields, transformedWhere, entityType, context) {
  whereInputObjectFields.forEach(whereInputObjectField => {
    const objectFieldInWhere = whereInputObjectField.name;
    if (transformedWhere[objectFieldInWhere]) {
      const objectFieldNameWherePart = transformedWhere[objectFieldInWhere];
      const fieldName = convertWhereArgumentToFieldName(objectFieldInWhere);
      if (isInputObject(whereInputObjectField)) {
        const childField = introspectionUtils.getChildFields(entityType, openCrudIntrospection).find(field => field.name === fieldName);
        const nestedObjectDAO = context.DAOs[`${lowerFirst(introspectionUtils.getFieldType(childField))}DAO`];
        transformedWhere[objectFieldInWhere] = transformComputedFieldsWhereArguments({
          originalWhere: objectFieldNameWherePart,
          whereInputName: whereInputObjectField.type.name,
          computedWhereArgumentsTransformation: nestedObjectDAO.computedWhereArgumentsTransformation,
          context,
          initialCall: false
        });
      }
    }
  });
}

function isInputObject(inputField) {
  return inputField.type.kind === 'INPUT_OBJECT';
}

function getWhereInputObjectFields(whereInputName) {
  return openCrudIntrospection.types.find(type => type.name === whereInputName).inputFields.filter(inputField => isInputObject(inputField));
}

function getEntityTypeFromWhereInput(whereInputName) {
  return introspectionUtils.findTypeInIntrospection(openCrudIntrospection, whereInputName.replace('WhereInput', ''));
}

module.exports = {
  transformComputedFieldsWhereArguments
};
