const Sequelize = require('sequelize');
const { trimEnd, lowerFirst } = require('lodash');

const Op = Sequelize.Op;

function buildConditionSubquery(targetModel, entityName, relatedEntityFilter, isNegative = false) {
  const positiveOrNegative = isNegative ? Op.not : Op.and;
  const queryGenerator = targetModel.QueryGenerator;
  let associationKey = Object.keys(targetModel.associations).find(k => targetModel.associations[k].target.name === entityName);
  let association = targetModel.associations[associationKey];
  let selectQuery;
  if (association.associationType === 'BelongsToMany') {
    selectQuery = handleBelongToMany(queryGenerator, association, targetModel, positiveOrNegative, relatedEntityFilter);
  } else {
    selectQuery = handleHasMany(queryGenerator, targetModel, entityName, positiveOrNegative, relatedEntityFilter);
  }
  return trimEnd(selectQuery, ';');
}

function handleBelongToMany(queryGenerator, association, targetModel, positiveOrNegative, relatedEntityFilter) {
  let referencingAssociationModel = association.target;
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
          }
        }
      ],
      where: {
        [positiveOrNegative]: relatedEntityFilter.where
      }
    },
    targetModel.associations.minister.target
  );
}

function handleHasMany(queryGenerator, targetModel, entityName, positiveOrNegative, relatedEntityFilter) {
  return queryGenerator.selectQuery(
    targetModel.getTableName(),
    {
      attributes: [targetModel.associations[lowerFirst(entityName)].identifierField],
      where: {
        [positiveOrNegative]: relatedEntityFilter.where
      }
    },
    targetModel
  );
}

module.exports = {
  buildConditionSubquery
};
