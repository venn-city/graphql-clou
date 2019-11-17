const { sequelizeDataProvider } = require('@venncity/sequelize-data-provider');
const { preCreation, postCreation, preUpdate, postUpdate } = require('../../../../src/index');

module.exports = {
  Query: {
    minister: async (parent, { where }) => {
      return sequelizeDataProvider.getEntity('Minister', where);
    },
    ministers: async (parent, args) => {
      return sequelizeDataProvider.getAllEntities('Minister', args);
    }
  },
  Mutation: {
    createMinister: async (parent, { data }, context) => {
      const postCreationCalls = await preCreation(context, data, 'Minister');
      const createdMinister = await sequelizeDataProvider.createEntity('Minister', data);
      await postCreation(postCreationCalls, createdMinister);
      return createdMinister;
    },
    deleteMinister: async (parent, { where }) => {
      return sequelizeDataProvider.deleteEntity('Minister', where);
    },
    updateMinister: async (parent, { data, where = {} }, context) => {
      const postUpdateCalls = await preUpdate(context, data, where, 'Minister');
      let updateMinister = await sequelizeDataProvider.updateEntity('Minister', data, where);
      await postUpdate(postUpdateCalls, updateMinister);
      return updateMinister;
    }
  },
  Minister: {
    ministry: async parent => {
      return sequelizeDataProvider.getRelatedEntity('Minister', parent.id, 'ministry');
    },
    votes: async parent => {
      return sequelizeDataProvider.getRelatedEntities('Minister', parent.id, 'votes');
    }
  }
};
