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
      return context.DAOs.ministerDAO.createMinister(context, data);
    },
    deleteMinister: async (parent, { where }, context) => {
      return context.DAOs.ministerDAO.deleteMinister(context, where);
    },
    updateMinister: async (parent, { data, where = {} }, context) => {
      return context.DAOs.ministerDAO.updateMinister(context, { data, where });
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
