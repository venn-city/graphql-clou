const { drop, endsWith, trimEnd, isNil, isEmpty, isArray, map, flatMap, lowerFirst, isString, snakeCase } = require('lodash');
const Sequelize = require('sequelize');
require('@venncity/nested-config')(__dirname);
let opencrudSchemaProvider = require('@venncity/opencrud-schema-provider');
const { isScalar, isObject, isList, getField, getFieldType } = opencrudSchemaProvider.graphqlSchemaUtils;
let { openCrudSchema } = opencrudSchemaProvider;
const { isEmptyArray, transformWithSymbols } = require('@venncity/clou-utils');
const { sq } = require('@venncity/sequelize-model');

const Op = Sequelize.Op;
const AND = 'AND';
const OR = 'OR';
const NOT = 'NOT';

function openCrudToSequelize({ where, first, skip, orderBy }, entityName, pathWithinSchema = [entityName]) {
  try {
    const sqWhereElements = [];
    const sqIncludeElements = [];
    let whereResult;
    if (where) {
      Object.keys(where).forEach(whereArg => {
        const { sqWhereElement, sqIncludeElement } = openCrudFilterToSequelize(whereArg, where[whereArg], entityName, pathWithinSchema);
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
      limit: first,
      offset: skip,
      order: orderBy && [orderBy.split('_')]
    };
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

function openCrudFilterToSequelize(whereArg, whereValue, entityName, pathWithinSchema) {
  let sqWhereElement;
  let sqIncludeElement;

  if (whereArg === AND) {
    const sqElements = whereValue.map(andElement => openCrudToSequelize({ where: andElement }, entityName, pathWithinSchema));
    if (!isEmptyArray(map(sqElements, 'where'))) {
      sqWhereElement = {
        [Op.and]: map(sqElements, 'where')
      };
    }
    sqIncludeElement = flatMap(sqElements, 'include');
  } else if (whereArg === OR) {
    const sqElements = whereValue.map(orElement => openCrudToSequelize({ where: orElement }, entityName, pathWithinSchema));
    if (!isEmptyArray(map(sqElements, 'where'))) {
      sqWhereElement = {
        [Op.or]: map(sqElements, 'where')
      };
    }
    sqIncludeElement = flatMap(sqElements, 'include');
  } else if (whereArg === NOT) {
    const sqElements = whereValue.map(andElement => openCrudToSequelize({ where: andElement }, entityName, pathWithinSchema));
    if (!isEmptyArray(map(sqElements, 'where'))) {
      sqWhereElement = {
        [Op.not]: { [Op.and]: map(sqElements, 'where') }
      };
    }
    sqIncludeElement = flatMap(sqElements, 'include');
  } else {
    const whereArgField = getField(openCrudSchema, entityName, whereArg);
    if (isScalar(whereArgField.type)) {
      sqWhereElement = handleScalarField(whereArgField, whereArg, whereValue);
    } else if (isObject(whereArgField.type)) {
      const objectFieldTransform = handleObjectField(whereArg, whereValue, entityName, pathWithinSchema);
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

function handleObjectField(whereArg, whereValue, entityName, pathWithinSchema) {
  const { includeElement, relatedEntityFilter } = handleRelation({
    whereValue,
    entityName,
    associationAlias: whereArg,
    required: false,
    pathWithinSchema,
    transformAssociationToNested: true
  });
  const sqWhereElement = relatedEntityFilter.where;
  includeElement.include = relatedEntityFilter.include;
  return { sqWhereElement, sqIncludeElement: includeElement };
}

function handleScalarField(whereArgField, whereArg, whereValue) {
  let sqWhereElement;
  if (whereArgField.name === whereArg) {
    sqWhereElement = { [whereArg]: whereValue };
  } else {
    Object.keys(gqlPostfixesToSqOps).forEach(gqlPostfixToSqOpKey => {
      if (endsWith(whereArg, gqlPostfixToSqOpKey)) {
        const fieldName = whereArg.replace(new RegExp(`${gqlPostfixToSqOpKey}$`), '');
        const gqlPostfixesToSqOp = gqlPostfixesToSqOps[gqlPostfixToSqOpKey];
        sqWhereElement = {
          [fieldName]: {
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
    const { includeElement, whereElement } = handleManyRelationEvery(whereArg, whereValue, entityName, pathWithinSchema);
    sqIncludeElement = includeElement;
    sqWhereElement = whereElement;
  } else if (endsWith(whereArg, '_none')) {
    const { includeElement, whereElement } = handleManyRelationNone(whereArg, whereValue, entityName, pathWithinSchema);
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

function handleManyRelationEvery(whereArg, whereValue, entityName, pathWithinSchema) {
  const associationAlias = whereArg.replace(new RegExp('_every'), '');
  const { includeElement, relatedEntityFilter, targetModel } = handleRelation({
    whereValue,
    entityName,
    associationAlias,
    required: false,
    pathWithinSchema,
    transformAssociationToNested: false
  });
  const negativeSubquery = buildConditionSubquery(targetModel, entityName, relatedEntityFilter, true);
  const whereElement = {
    id: {
      [Op.ne]: {
        [Op.all]: Sequelize.literal(negativeSubquery)
      }
    }
  };
  return { includeElement, whereElement };
}

function handleManyRelationNone(whereArg, whereValue, entityName, pathWithinSchema) {
  const associationAlias = whereArg.replace(new RegExp('_none'), '');
  const { includeElement, relatedEntityFilter, targetModel } = handleRelation({
    whereValue,
    entityName,
    associationAlias,
    required: false,
    pathWithinSchema,
    transformAssociationToNested: false
  });
  const negativeSubquery = buildConditionSubquery(targetModel, entityName, relatedEntityFilter);
  const whereElement = {
    id: {
      [Op.ne]: {
        [Op.all]: Sequelize.literal(negativeSubquery)
      }
    }
  };
  return { includeElement, whereElement };
}

function handleRelation({ whereValue, entityName, associationAlias, required, pathWithinSchema, transformAssociationToNested = true }) {
  const relatedEntityName = getFieldType(openCrudSchema, entityName, associationAlias);
  const relatedEntityFilter = openCrudToSequelize({ where: whereValue }, relatedEntityName, [...pathWithinSchema, associationAlias]);

  if (transformAssociationToNested) {
    relatedEntityFilter.where = transformWhereToNested(relatedEntityName, pathWithinSchema, associationAlias, relatedEntityFilter);
  }
  const associationInfo = Object.values(sq[entityName].associations).find(association => association.as === associationAlias);
  const targetModel = associationInfo.target;
  const includeElement = {
    model: targetModel,
    as: associationAlias,
    required
  };
  correctManyRelationJoin(associationInfo, transformAssociationToNested, includeElement);
  return { includeElement, targetModel, relatedEntityFilter };
}

function correctManyRelationJoin(associationInfo, transformAssociationToNested, includeElement) {
  // Without the 'duplicating' flag, sequelize produced an invalid sql statement.
  // For reference see: https://github.com/sequelize/sequelize/issues/9869
  if ((associationInfo.associationType === 'BelongsToMany' || associationInfo.associationType === 'HasMany') && transformAssociationToNested) {
    includeElement.duplicating = false;
  }
}

function transformWhereToNested(relatedEntityName, pathWithinSchema, associationAlias, relatedEntityFilter) {
  return transformWithSymbols.transformer({
    transformKey: (value, fieldName) => {
      if (isString(fieldName) && getField(openCrudSchema, relatedEntityName, fieldName)) {
        const pathWithoutRoot = drop(pathWithinSchema, 1);
        const ancestorRelations = isEmptyArray(pathWithoutRoot) ? '' : `${pathWithoutRoot.join('.')}.`;
        return `$${ancestorRelations}${associationAlias}.${snakeCase(fieldName)}$`;
      }
      return fieldName;
    } // TODO: also handle: entity: null - e.g. parentEntity { childEntity: null}
  })(relatedEntityFilter.where);
}

function buildConditionSubquery(targetModel, entityName, relatedEntityFilter, isNegative = false) {
  const tableName = targetModel.getTableName();
  const queryGenerator = targetModel.QueryGenerator;
  const positiveOrNegative = isNegative ? Op.not : Op.and;
  return trimEnd(
    queryGenerator.selectQuery(
      tableName,
      {
        attributes: [targetModel.associations[lowerFirst(entityName)].identifierField],
        where: {
          [positiveOrNegative]: relatedEntityFilter.where
        }
      },
      targetModel
    ),
    ';'
  );
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
