import { preCreation, postCreation, preUpdate, postUpdate } from '../../../../nestedMutationHooks';

export default {
  Query: {
    minister: async (parent, { where }, context) => {
      return context.DAOs.ministerDAO.minister(context, where);
    },
    ministers: async (parent, args, context) => {
      return context.DAOs.ministerDAO.ministers(context, args);
    }
  },
  Mutation: {
    createMinister: async (parent, { data }, context) => {
      const postCreationCalls = await preCreation(context, data, 'Minister');
      const createdMinister = await context.DAOs.ministerDAO.createMinister(context, data);
      await postCreation(postCreationCalls, createdMinister);
      return createdMinister;
    },
    deleteMinister: async (parent, { where }, context) => {
      return context.DAOs.ministerDAO.deleteMinister(context, where);
    },
    updateMinister: async (parent, { data, where = {} }, context) => {
      const postUpdateCalls = await preUpdate(context, data, where, 'Minister');
      const updateMinister = await context.DAOs.ministerDAO.updateMinister(context, { data, where });
      await postUpdate(postUpdateCalls, updateMinister);
      return updateMinister;
    }
  },
  Minister: {
    ministry: async (parent, args, context) => {
      return context.DAOs.ministerDAO.getRelatedEntity(parent.id, 'ministry', context);
    },
    votes: async (parent, args, context) => {
      return context.DAOs.ministerDAO.getRelatedEntities(parent.id, 'votes', context);
    }
  }
};
