const { sequelizeDataProvider } = require('@venncity/sequelize-data-provider');
const { preCreation, postCreation, preUpdate, postUpdate } = require('../../../../src/index');

module.exports = {
  Query: {
    government: async (parent, { where }) => {
      return sequelizeDataProvider.getEntity('Government', where);
    },
    governments: async (parent, args) => {
      return sequelizeDataProvider.getAllEntities('Government', args);
    }
  },
  Mutation: {
    createGovernment: async (parent, { data }, context) => {
      const postCreationCalls = await preCreation(context, data, 'Government');
      const createdGovernment = await sequelizeDataProvider.createEntity('Government', data);
      await postCreation(postCreationCalls, createdGovernment);
      return createdGovernment;
    },
    deleteGovernment: async (parent, { where }) => {
      return sequelizeDataProvider.deleteEntity('Government', where);
    },
    updateGovernment: async (parent, { data, where = {} }, context) => {
      const postUpdateCalls = await preUpdate(context, data, where, 'Government');
      const updateGovernment = await sequelizeDataProvider.updateEntity('Government', data, where);
      await postUpdate(postUpdateCalls, updateGovernment);
      return updateGovernment;
    }
  },
  Government: {
    ministries: async (parent, args) => {
      return sequelizeDataProvider.getRelatedEntities('Government', parent.id, 'ministries', args);
    }
  }
};
