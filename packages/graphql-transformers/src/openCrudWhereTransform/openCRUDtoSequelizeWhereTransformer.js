const { drop, endsWith, isNil, isEmpty, isArray, map, flatMap, isString } = require('lodash');
const Sequelize = require('@venncity/sequelize');
require('@venncity/nested-config')(__dirname);
const opencrudSchemaProvider = require('@venncity/opencrud-schema-provider');

const { isScalar, isObject, isList, getField, getFieldType } = opencrudSchemaProvider.graphqlSchemaUtils;
const { openCrudSchema } = opencrudSchemaProvider;
const { isEmptyArray, transformWithSymbols } = require('@venncity/clou-utils');
const { sq } = require('@venncity/sequelize-model');
const { buildConditionSubquery } = require('./manyRelationConditionSubquery');
const sequelizeConsts = require('./sequelizeConsts');
const { shouldLimitInFetch } = require('./../resultLimiter/resultLimiter');

const { BELONGS_TO_MANY, HAS_MANY } = sequelizeConsts.RELATION_TYPES;

const Op = Sequelize.Op;
const AND = 'AND';
const OR = 'OR';
const NOT = 'NOT';

function openCrudToSequelize({ where, first, skip, orderBy = 'id_ASC' }, entityName, pathWithinSchema = [entityName], useColumnNames = false) {
  try {
    const sqWhereElements = [];
    const sqIncludeElements = [];
    let whereResult;
    if (where) {
      Object.keys(where).forEach(whereArg => {
        const { sqWhereElement, sqIncludeElement } = openCrudFilterToSequelize(
          whereArg,
          where[whereArg],
          entityName,
          pathWithinSchema,
          useColumnNames
        );
        pushNotEmpty(sqWhereElements, sqWhereElement);
        pushNotEmpty(sqIncludeElements, sqIncludeElement);
      });
      if (!isEmptyArray(sqWhereElements)) {
        whereResult = {
          where: {
            [Op.and]: sqWhereElements
          }
        };
      }
    }
    let sqFilter = {
      include: sqIncludeElements,
      order: orderBy && [orderBy.split('_')]
    };
    if (shouldLimitInFetch({ where })) {
      sqFilter.limit = first;
      sqFilter.offset = skip;
      addSelectAttributes(sqFilter, entityName);
    }
    if (whereResult) {
      sqFilter = {
        ...sqFilter,
        where: whereResult.where
      };
    }
    return sqFilter;
  } catch (e) {
    console.error('Error at openCrudToSequelize', { where, first, skip, orderBy, entityName, pathWithinSchema }, e);
    throw e;
  }
}

function openCrudFilterToSequelize(whereArg, whereValue, entityName, pathWithinSchema, useColumnNames) {
  let sqWhereElement;
  let sqIncludeElement;

  if (whereArg === AND) {
    const sqElements = whereValue.map(andElement => openCrudToSequelize({ where: andElement }, entityName, pathWithinSchema, useColumnNames));
    if (!isEmptyArray(map(sqElements, 'where'))) {
      sqWhereElement = {
        [Op.and]: map(sqElements, 'where')
      };
    }
    sqIncludeElement = flatMap(sqElements, 'include');
  } else if (whereArg === OR) {
    const sqElements = whereValue.map(orElement => openCrudToSequelize({ where: orElement }, entityName, pathWithinSchema, useColumnNames));
    if (!isEmptyArray(map(sqElements, 'where'))) {
      sqWhereElement = {
        [Op.or]: map(sqElements, 'where')
      };
    }
    sqIncludeElement = flatMap(sqElements, 'include');
  } else if (whereArg === NOT) {
    const sqElements = whereValue.map(andElement => openCrudToSequelize({ where: andElement }, entityName, pathWithinSchema, useColumnNames));
    if (!isEmptyArray(map(sqElements, 'where'))) {
      sqWhereElement = {
        [Op.not]: { [Op.and]: map(sqElements, 'where') }
      };
    }
    sqIncludeElement = flatMap(sqElements, 'include');
  } else {
    const whereArgField = getField(openCrudSchema, entityName, whereArg);
    if (isScalar(whereArgField.type)) {
      sqWhereElement = handleScalarField(whereArgField, whereArg, whereValue, entityName, useColumnNames);
    } else if (isObject(whereArgField.type)) {
      const objectFieldTransform = handleObjectField(whereArg, whereValue, entityName, pathWithinSchema, useColumnNames);
      sqWhereElement = objectFieldTransform.sqWhereElement;
      sqIncludeElement = objectFieldTransform.sqIncludeElement;
    } else if (isList(whereArgField.type)) {
      const listFieldTransform = handleListField(whereArg, whereValue, entityName, pathWithinSchema);
      sqIncludeElement = listFieldTransform.sqIncludeElement;
      sqWhereElement = listFieldTransform.sqWhereElement;
    }
  }
  return { sqWhereElement, sqIncludeElement };
}

function handleObjectField(whereArg, whereValue, entityName, pathWithinSchema, useColumnNames = false) {
  const { includeElement, relatedEntityFilter } = handleRelation({
    whereValue,
    entityName,
    associationAlias: whereArg,
    required: false,
    pathWithinSchema,
    transformAssociationToNested: true,
    useColumnNames
  });
  const sqWhereElement = relatedEntityFilter.where;
  includeElement.include = relatedEntityFilter.include;
  return { sqWhereElement, sqIncludeElement: includeElement };
}

function getFieldNameForQuery(useColumnNames, fieldName, entityName) {
  return !useColumnNames ? fieldName : sq[entityName].rawAttributes[fieldName].field;
}

function handleScalarField(whereArgField, whereArg, whereValue, entityName, useColumnNames) {
  let sqWhereElement;
  if (whereArgField.name === whereArg) {
    const fieldNameForQuery = getFieldNameForQuery(useColumnNames, whereArg, entityName);
    sqWhereElement = { [fieldNameForQuery]: whereValue };
  } else {
    Object.keys(gqlPostfixesToSqOps).forEach(gqlPostfixToSqOpKey => {
      if (endsWith(whereArg, gqlPostfixToSqOpKey)) {
        const fieldName = whereArg.replace(new RegExp(`${gqlPostfixToSqOpKey}$`), '');
        const fieldNameForQuery = getFieldNameForQuery(useColumnNames, fieldName, entityName);
        const gqlPostfixesToSqOp = gqlPostfixesToSqOps[gqlPostfixToSqOpKey];
        sqWhereElement = {
          [fieldNameForQuery]: {
            [gqlPostfixesToSqOp.op]: gqlPostfixesToSqOp.valueTransformer(whereValue)
          }
        };
      }
    });
    if (!sqWhereElement) {
      throw new Error(`Unsupported where conditions, ${JSON.stringify({ [whereArg]: whereValue })}`);
    }
  }
  return sqWhereElement;
}

function handleListField(whereArg, whereValue, entityName, pathWithinSchema) {
  let sqIncludeElement;
  let sqWhereElement;
  if (endsWith(whereArg, '_some')) {
    const { includeElement, whereElement } = handleManyRelationSome(whereArg, whereValue, entityName, pathWithinSchema);
    sqIncludeElement = includeElement;
    sqWhereElement = whereElement;
  } else if (endsWith(whereArg, '_every')) {
    const { includeElement, whereElement } = handleManyRelationEvery(whereArg, whereValue, entityName);
    sqIncludeElement = includeElement;
    sqWhereElement = whereElement;
  } else if (endsWith(whereArg, '_none')) {
    const { includeElement, whereElement } = handleManyRelationNone(whereArg, whereValue, entityName);
    sqIncludeElement = includeElement;
    sqWhereElement = whereElement;
  } else {
    throw new Error(`Unsupported many-relation where conditions, ${JSON.stringify({ [whereArg]: whereValue })}`);
  }
  return { sqIncludeElement, sqWhereElement };
}

function handleManyRelationSome(whereArg, whereValue, entityName, pathWithinSchema) {
  const associationAlias = whereArg.replace(new RegExp('_some'), '');
  const { includeElement, relatedEntityFilter } = handleRelation({
    whereValue,
    entityName,
    associationAlias,
    required: false,
    pathWithinSchema,
    transformAssociationToNested: true
  });
  includeElement.include = relatedEntityFilter.include;
  return { includeElement, whereElement: relatedEntityFilter.where };
}

function handleManyRelationEvery(whereArg, whereValue, entityName) {
  const associationAlias = whereArg.replace(new RegExp('_every'), '');
  const where = {};
  where[`${associationAlias}_some`] = whereValue;
  const targetModel = sq[entityName];
  const filter = openCrudToSequelize({ where }, entityName);
  const query = buildConditionSubquery(targetModel, filter, true);
  const whereElement = { id: { [Op.notIn]: Sequelize.literal(`(${query})`) } };
  return { includeElement: null, whereElement };
}

function handleManyRelationNone(whereArg, whereValue, entityName) {
  const associationAlias = whereArg.replace(new RegExp('_none'), '');
  const where = {};
  where[`${associationAlias}_some`] = whereValue;
  const targetModel = sq[entityName];
  const filter = openCrudToSequelize({ where }, entityName);
  const query = buildConditionSubquery(targetModel, filter, false);
  const whereElement = { id: { [Op.notIn]: Sequelize.literal(`(${query})`) } };
  return { includeElement: null, whereElement };
}

function handleRelation({
  whereValue,
  entityName,
  associationAlias,
  required,
  pathWithinSchema,
  transformAssociationToNested = true,
  useColumnNames = false
}) {
  const relatedEntityName = getFieldType(openCrudSchema, entityName, associationAlias);
  const relatedEntityFilter = openCrudToSequelize({ where: whereValue }, relatedEntityName, [...pathWithinSchema, associationAlias], useColumnNames);
  if (whereValue === null) {
    // Build a condition which is only satisfied when the related entity is null
    relatedEntityFilter.where = {
      [`$${associationAlias}.id$`]: null
    };
  }

  if (transformAssociationToNested && !useColumnNames) {
    relatedEntityFilter.where = transformWhereToNested(relatedEntityName, pathWithinSchema, associationAlias, relatedEntityFilter);
  }
  const associationInfo = Object.values(sq[entityName].associations).find(association => association.as === associationAlias);
  const targetModel = associationInfo.target;
  const includeElement = {
    model: targetModel,
    as: associationAlias,
    required,
    // Do not select anything from the joined entities.
    // This is required as otherwise limit doesn't work correctly on 1xn, nxm joins when query is ran with limit.
    // On the other hand, we can do it here, as this code is designed to run from within graphql resolvers,
    // where each resolver only needs to fetch its own entity, and joined entities will be later joined from the child resolvers.
    attributes: []
  };
  correctManyRelationJoin(associationInfo, transformAssociationToNested, includeElement);
  return { includeElement, targetModel, relatedEntityFilter };
}

function correctManyRelationJoin(associationInfo, transformAssociationToNested, includeElement) {
  // Without the 'duplicating' flag, sequelize produced an invalid sql statement.
  // For reference see: https://github.com/sequelize/sequelize/issues/9869
  if ((associationInfo.associationType === BELONGS_TO_MANY || associationInfo.associationType === HAS_MANY) && transformAssociationToNested) {
    includeElement.duplicating = false;
  }
}

function transformWhereToNested(relatedEntityName, pathWithinSchema, associationAlias, relatedEntityFilter) {
  return transformWithSymbols.transformer({
    transformers: [
      {
        cond: value => {
          return value instanceof Sequelize.Utils.Fn;
        },
        func: (value, key, transform) => {
          value.args = transform(value.args, 'args');
          return value;
        }
      },
      {
        cond: value => {
          return value instanceof Sequelize.Utils.Literal;
        },
        func: (value, key, transform) => {
          value.val = transform(value.val, 'val');
          return value;
        }
      }
    ],
    transformKey: (value, fieldName) => {
      if (isString(fieldName) && getField(openCrudSchema, relatedEntityName, fieldName)) {
        const pathWithoutRoot = drop(pathWithinSchema, 1);
        const ancestorRelations = isEmptyArray(pathWithoutRoot) ? '' : `${pathWithoutRoot.join('.')}.`;
        const relatedColumnName = sq[relatedEntityName].rawAttributes[fieldName].field;
        return `$${ancestorRelations}${associationAlias}.${relatedColumnName}$`;
      }
      return fieldName;
    } // TODO: also handle: entity: null - e.g. parentEntity { childEntity: null}
  })(relatedEntityFilter.where);
}

function addSelectAttributes(sqFilter, entityName) {
  const includeAttributes = [];
  const excludeAttributes = [];
  const rawAttributes = sq[entityName].rawAttributes;
  Object.keys(rawAttributes).forEach(rawAttrKey => {
    const attribute = rawAttributes[rawAttrKey];
    if (attribute.type.toString() === 'JSON') {
      // Need to transform JSON fields to text so that the distinct operator won't fail, as it can't compare json fields.
      includeAttributes.push([Sequelize.literal(`"${entityName}"."${attribute.field}" #>> '{}'`), attribute.fieldName]);
      excludeAttributes.push(attribute.fieldName);
    }
  });

  sqFilter.attributes = {
    // Relies on https://github.com/venn-city/sequelize/commit/83b768a4fb78f28d5d1769a4d2f4394e2b7e10d9
    // Needed so that limit on the root level of the query works as expected,
    // as without it, joins tables of 1xn or nxm generate multiple (duplicate rows) which throws off the expected limit.
    include: [[Sequelize.fn('DISTINCT', Sequelize.col(`${entityName}.id`)), 'id'], ...includeAttributes],
    exclude: [...excludeAttributes]
  };
}

function pushNotEmpty(array, other) {
  if (!isNil(other)) {
    if (isArray(other)) {
      if (!isEmpty(other)) {
        other.forEach(o => array.push(o));
      }
    } else {
      array.push(other);
    }
  }
}

const gqlPostfixesToSqOps = {
  _not: { op: Op.not, valueTransformer: v => v },
  _in: { op: Op.in, valueTransformer: v => (Array.isArray(v) ? v : [v]) },
  _not_in: { op: Op.notIn, valueTransformer: v => (Array.isArray(v) ? v : [v]) },
  _lt: { op: Op.lt, valueTransformer: v => v },
  _lte: { op: Op.lte, valueTransformer: v => v },
  _gt: { op: Op.gt, valueTransformer: v => v },
  _gte: { op: Op.gte, valueTransformer: v => v },
  _contains: { op: Op.like, valueTransformer: v => `%${v}%` },
  _not_contains: { op: Op.notLike, valueTransformer: v => `%${v}%` },
  _starts_with: { op: Op.like, valueTransformer: v => `${v}%` },
  _not_starts_with: { op: Op.notLike, valueTransformer: v => `${v}%` },
  _ends_with: { op: Op.like, valueTransformer: v => `%${v}` },
  _not_ends_with: { op: Op.notLike, valueTransformer: v => `%${v}` }
};

module.exports = {
  openCrudToSequelize
};
