const { sequelizeDataProvider } = require('@venncity/sequelize-data-provider');
const { preCreation, postCreation, preUpdate, postUpdate } = require('../../../../src/index');

module.exports = {
  Query: {
    ministry: async (parent, { where }) => {
      return sequelizeDataProvider.getEntity('Ministry', where);
    },
    ministries: async (parent, args) => {
      return sequelizeDataProvider.getAllEntities('Ministry', args);
    }
  },
  Mutation: {
    createMinistry: async (parent, { data }, context) => {
      const postCreationCalls = await preCreation(context, data, 'Ministry');
      const createdMinistry = await sequelizeDataProvider.createEntity('Ministry', data);
      await postCreation(postCreationCalls, createdMinistry);
      return createdMinistry;
    },
    deleteMinistry: async (parent, { where }) => {
      return sequelizeDataProvider.deleteEntity('Ministry', where);
    },
    updateMinistry: async (parent, { data, where = {} }, context) => {
      const postUpdateCalls = await preUpdate(context, data, where, 'Ministry');
      let updateMinistry = await sequelizeDataProvider.updateEntity('Ministry', data, where);
      await postUpdate(postUpdateCalls, updateMinistry);
      return updateMinistry;
    }
  },
  Ministry: {
    minister: async (parent) => {
      return sequelizeDataProvider.getRelatedEntity('Ministry', parent.id, 'minister');
    },
    government: async (parent) => {
      return sequelizeDataProvider.getRelatedEntity('Ministry', parent.id, 'government');
    }
  }
};
