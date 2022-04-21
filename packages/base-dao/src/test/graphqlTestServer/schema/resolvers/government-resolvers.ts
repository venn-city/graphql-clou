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
      const createdGovernment = await context.DAOs.governmentDAO.createGovernment(context, data);
      return createdGovernment;
    },
    deleteGovernment: async (parent, { where }, context) => {
      return context.DAOs.governmentDAO.deleteGovernment(context, where);
    },
    updateGovernment: async (parent, { data, where = {} }, context) => {
      const updateGovernment = await context.DAOs.governmentDAO.updateGovernment(context, { data, where });
      return updateGovernment;
    }
  },
  Government: {
    ministries: async (parent, args, context) => {
      return context.DAOs.governmentDAO.getRelatedEntities(parent.id, 'ministries', context, args);
    }
  }
};
