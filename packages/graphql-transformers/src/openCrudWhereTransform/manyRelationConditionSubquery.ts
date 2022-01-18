import Sequelize from 'sequelize';
import { trimEnd } from 'lodash';

const Op = Sequelize.Op;

export function buildConditionSubquery(targetModel, filter, isNegative = false) {
  const positiveOrNegative = isNegative ? Op.not : Op.and;
  const queryGenerator = targetModel.queryGenerator;
  const options = {
    ...filter,
    attributes: ['id'],
    where: {
      [Op.and]: [
        {
          [positiveOrNegative]: filter.where
        }
      ]
    }
  };
  addIntermediateModelsToOptions(targetModel, options);
  removeIncludesAttributes(options.include);
  const selectQuery = queryGenerator.selectQuery(targetModel.getTableName(), options, targetModel);
  return trimEnd(selectQuery, ';');
}

function addIntermediateModelsToOptions(model, options) {
  // This internal method is used by Sequielize to add all models needed to constract a query
  // For ex. model A is requested, but given filter is executed on model D, so request should include A->B->C->D models
  // Providing model A and options with filter on model D, this function adds B and C into includes of options
  // @ts-ignore
  // eslint-disable-next-line no-underscore-dangle
  Sequelize.Model._validateIncludedElements.bind(model)(options);
}

function removeIncludesAttributes(includes) {
  if (includes) {
    includes.forEach(i => {
      if (i.attributes) {
        i.attributes = [];
      }
      removeIncludesAttributes(i.include);
    });
  }
}

export default {
  buildConditionSubquery
};
