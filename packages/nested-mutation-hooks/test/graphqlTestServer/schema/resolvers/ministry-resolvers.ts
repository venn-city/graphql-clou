import { sequelizeDataProvider } from '@venncity/sequelize-data-provider';
import { preCreation, postCreation, preUpdate, postUpdate } from '../../../../src/index';

export default {
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
      const updateMinistry = await sequelizeDataProvider.updateEntity('Ministry', data, where);
      await postUpdate(postUpdateCalls, updateMinistry);
      return updateMinistry;
    }
  },
  Ministry: {
    minister: async parent => {
      return sequelizeDataProvider.getRelatedEntity('Ministry', parent.id, 'minister');
    },
    government: async parent => {
      return sequelizeDataProvider.getRelatedEntity('Ministry', parent.id, 'government');
    }
  }
};
