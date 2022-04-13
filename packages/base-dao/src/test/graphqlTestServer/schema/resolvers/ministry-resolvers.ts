import { preCreation, postCreation, preUpdate, postUpdate } from '../../../../nestedMutationHooks';

export default {
  Query: {
    ministry: async (parent, { where }, context) => {
      return context.DAOs.ministryDAO.ministry(context, where);
    },
    ministries: async (parent, args, context) => {
      return context.DAOs.ministryDAO.ministries(context, args);
    }
  },
  Mutation: {
    createMinistry: async (parent, { data }, context) => {
      const postCreationCalls = await preCreation(context, data, 'Ministry');
      const createdMinistry = await context.DAOs.ministryDAO.createMinistry(context, data);
      await postCreation(postCreationCalls, createdMinistry);
      return createdMinistry;
    },
    deleteMinistry: async (parent, { where }, context) => {
      return context.DAOs.ministryDAO.deleteMinistry(context, where);
    },
    updateMinistry: async (parent, { data, where = {} }, context) => {
      const postUpdateCalls = await preUpdate(context, data, where, 'Ministry');
      const updateMinistry = await context.DAOs.ministryDAO.updateMinistry(context, { data, where });
      await postUpdate(postUpdateCalls, updateMinistry);
      return updateMinistry;
    }
  },
  Ministry: {
    minister: async (parent, args, context) => {
      return context.DAOs.ministryDAO.getRelatedEntity(parent.id, 'minister', context);
    },
    government: async (parent, args, context) => {
      return context.DAOs.ministryDAO.getRelatedEntity(parent.id, 'government', context);
    }
  }
};
