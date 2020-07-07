import { replace, cloneDeep, lowerFirst, isEmpty } from 'lodash';
import asyncUtil from 'async';
import { getOpenCrudIntrospection, introspectionUtils } from '@venncity/opencrud-schema-provider';

const openCrudIntrospection = getOpenCrudIntrospection();

export async function transformComputedFieldsWhereArguments({
  originalWhere,
  whereInputName,
  computedWhereArgumentsTransformation,
  context,
  initialCall = true
}) {
  let transformedWhere = cloneIfRequired(initialCall, originalWhere);
  if (originalWhere) {
    if (computedWhereArgumentsTransformation) {
      transformedWhere = await replaceTopLevelWhereFields(
        computedWhereArgumentsTransformation,
        transformedWhere,
        whereInputName,
        context,
        originalWhere
      );
      await replaceBooleanOperators(transformedWhere, whereInputName, computedWhereArgumentsTransformation, context);
    }
    const whereInputObjectFields = getWhereInputObjectFields(whereInputName);
    const entityType = getEntityTypeFromWhereInput(whereInputName);
    await replaceWhereNestedObjectFields(whereInputObjectFields, transformedWhere, entityType, context);
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

async function replaceTopLevelWhereFields(computedWhereArgumentsTransformation, transformedWhere, whereInputName, context, originalWhere) {
  await replaceBooleanOperators(transformedWhere, whereInputName, computedWhereArgumentsTransformation, context);

  const transformedWhereList = await asyncUtil.reduce(Object.keys(transformedWhere), [{}], async (memo, originalWhereArgumentName) => {
    const transformationFunction = computedWhereArgumentsTransformation[originalWhereArgumentName];
    const originalWhereValue = transformedWhere[originalWhereArgumentName];
    // computed field
    if (transformationFunction) {
      if (originalWhereValue === undefined) {
        return memo;
      }
      const transformedWhereArgument = await transformationFunction(originalWhereValue, originalWhere, context);
      // @ts-ignore
      return [...memo, transformedWhereArgument];
    }
    // regular field
    return [
      {
        // @ts-ignore
        ...memo[0],
        [originalWhereArgumentName]: originalWhereValue
      },
      // @ts-ignore
      ...memo.slice(1)
    ];
  });
  // remove first value in case of empty object (there are no regular fields)
  // @ts-ignore
  const filteredTransformedWhereList = transformedWhereList.filter(value => !isEmpty(value));
  // there is only one condition
  if (filteredTransformedWhereList.length === 1) {
    return filteredTransformedWhereList[0];
  }
  return {
    AND: filteredTransformedWhereList
  };
}

async function replaceBooleanOperators(transformedWhere, whereInputName, computedWhereArgumentsTransformation, context) {
  const booleanOperators = ['AND', 'OR', 'NOT'];
  await asyncUtil.forEach(booleanOperators, async operator => {
    if (transformedWhere[operator]) {
      transformedWhere[operator] = await asyncUtil.map(transformedWhere[operator], async whereElementWithinBooleanOperator => {
        const transformedWhereArg = await transformComputedFieldsWhereArguments({
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

async function replaceWhereNestedObjectFields(whereInputObjectFields, transformedWhere, entityType, context) {
  await asyncUtil.forEach(whereInputObjectFields, async (whereInputObjectField: any) => {
    const objectFieldInWhere = whereInputObjectField.name;
    if (transformedWhere[objectFieldInWhere]) {
      const objectFieldNameWherePart = transformedWhere[objectFieldInWhere];
      const fieldName = convertWhereArgumentToFieldName(objectFieldInWhere);
      if (isInputObject(whereInputObjectField)) {
        const childField = introspectionUtils.getChildFields(entityType, openCrudIntrospection).find(field => field.name === fieldName);
        const nestedObjectDAO = context.DAOs[`${lowerFirst(introspectionUtils.getFieldType(childField))}DAO`];
        transformedWhere[objectFieldInWhere] = await transformComputedFieldsWhereArguments({
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

export default {
  transformComputedFieldsWhereArguments
};
