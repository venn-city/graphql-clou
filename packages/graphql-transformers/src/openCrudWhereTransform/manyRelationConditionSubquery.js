const Sequelize = require('@venncity/sequelize');
const { trimEnd, lowerFirst } = require('lodash');
const sequelizeConsts = require('./sequelizeConsts');

const { BELONGS_TO_MANY } = sequelizeConsts.RELATION_TYPES;

const Op = Sequelize.Op;

function buildConditionSubquery(targetModel, entityName, relatedEntityFilter, isNegative = false, pathWithinSchema) {
  const positiveOrNegative = isNegative ? Op.not : Op.and;
  const queryGenerator = targetModel.QueryGenerator;
  const associationKey = Object.keys(targetModel.associations).find(k => targetModel.associations[k].target.name === entityName);
  const association = targetModel.associations[associationKey];
  let selectQuery;
  if (association.associationType === BELONGS_TO_MANY) {
    selectQuery = handleBelongToMany(queryGenerator, association, targetModel, positiveOrNegative, relatedEntityFilter);
  } else {
    selectQuery = handleHasMany(queryGenerator, association, targetModel, entityName, positiveOrNegative, relatedEntityFilter, pathWithinSchema);
  }
  return trimEnd(selectQuery, ';');
}

function handleBelongToMany(queryGenerator, association, targetModel, positiveOrNegative, relatedEntityFilter) {
  const referencingAssociationModel = association.target;
  const fieldAlias = Object.keys(referencingAssociationModel.associations).find(
    k => referencingAssociationModel.associations[k].target.name === targetModel.name
  );
  return queryGenerator.selectQuery(
    referencingAssociationModel.getTableName(),
    {
      attributes: ['id'],
      model: referencingAssociationModel,
      include: [
        {
          model: targetModel,
          association: referencingAssociationModel.associations[fieldAlias],
          parent: { model: referencingAssociationModel },
          as: fieldAlias,
          required: true,
          attributes: [],
          through: {
            as: association.combinedTableName,
            attributes: [],
            model: {
              getTableName: () => {
                return association.throughModel.getTableName();
              }
            }
          },
          where: {
            [positiveOrNegative]: relatedEntityFilter.where
          }
        }
      ]
    },
    referencingAssociationModel
  );
}

/*
 Generates something like:
   SELECT "government_id"
   FROM "venn"."ministries" AS "Ministry"
   WHERE (NOT (("Ministry"."name" LIKE '%e28447')) AND
          "Ministry"."government_id" = "Government"."id")
 */
function handleHasMany(queryGenerator, association, targetModel, entityName, positiveOrNegative, relatedEntityFilter, pathWithinSchema) {
  const foreignKeyColumnToOriginalEntity = targetModel.associations[lowerFirst(entityName)].identifierField;
  const originalEntityIdColumn = pathWithinSchema.length > 1 ? Sequelize.col(`${lowerFirst(entityName)}.id`) : Sequelize.col(`${entityName}.id`);
  const foreignKeyFieldToOriginalEntity = Object.keys(targetModel.rawAttributes).find(
    key => targetModel.rawAttributes[key].field === foreignKeyColumnToOriginalEntity
  );
  const selectQuery = queryGenerator.selectQuery(
    targetModel.getTableName(),
    {
      attributes: [foreignKeyColumnToOriginalEntity],
      where: {
        [Op.and]: [
          {
            [positiveOrNegative]: relatedEntityFilter.where
          },
          // Generates the second condition inside the where, which matches this inner select to the parent where condition.
          Sequelize.where(targetModel.rawAttributes[foreignKeyFieldToOriginalEntity], originalEntityIdColumn)
        ]
      }
    },
    targetModel
  );
  return selectQuery;
}

module.exports = {
  buildConditionSubquery
};
