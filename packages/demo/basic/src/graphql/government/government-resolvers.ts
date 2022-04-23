export default {
  Query: {
    government: async (parent, { where }, context) => {
      return context.DAOs.governmentDAO.government(context, where);
    },
    governments: async (parent, args, context) => {
      return context.DAOs.governmentDAO.governments(context, args);
    }
  },
  Mutation: {
    createGovernment: async (parent, { data }, context) => {
      return context.DAOs.governmentDAO.createGovernment(context, data);
    },
    deleteGovernment: async (parent, { where }, context) => {
      return context.DAOs.governmentDAO.deleteGovernment(context, where);
    },
    updateGovernment: async (parent, { data, where = {} }, context) => {
      return context.DAOs.governmentDAO.updateGovernment(context, { data, where });
    }
  },
  Government: {
    ministries: async (parent, args, context) => {
      return context.DAOs.governmentDAO.getRelatedEntities(parent.id, 'ministries', context, args);
    }
  }
};
