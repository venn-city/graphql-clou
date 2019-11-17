const { sequelizeDataProvider } = require('@venncity/sequelize-data-provider');
const { preCreation, postCreation, preUpdate, postUpdate } = require('../../../../src/index');

module.exports = {
  Query: {
    vote: async (parent, { where }) => {
      return sequelizeDataProvider.getEntity('Vote', where);
    },
    ministries: async (parent, args) => {
      return sequelizeDataProvider.getAllEntities('Vote', args);
    }
  },
  Mutation: {
    createVote: async (parent, { data }, context) => {
      const postCreationCalls = await preCreation(context, data, 'Vote');
      const createdVote = await sequelizeDataProvider.createEntity('Vote', data);
      await postCreation(postCreationCalls, createdVote);
      return createdVote;
    },
    deleteVote: async (parent, { where }) => {
      return sequelizeDataProvider.deleteEntity('Vote', where);
    },
    updateVote: async (parent, { data, where = {} }, context) => {
      const postUpdateCalls = await preUpdate(context, data, where, 'Vote');
      let updateVote = await sequelizeDataProvider.updateEntity('Vote', data, where);
      await postUpdate(postUpdateCalls, updateVote);
      return updateVote;
    }
  },
  Vote: {
    minister: async (parent) => {
      return sequelizeDataProvider.getRelatedEntity('Vote', parent.id, 'minister');
    }
  }
};
