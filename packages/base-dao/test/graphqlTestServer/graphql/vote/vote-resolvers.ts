export default {
  Query: {
    vote: async (parent, { where }, context) => {
      return context.DAOs.voteDAO.vote(context, where);
    },
    votes: async (parent, args, context) => {
      return context.DAOs.voteDAO.votes(context, args);
    }
  },
  Mutation: {
    createVote: async (parent, { data }, context) => {
      const createdVote = await context.DAOs.voteDAO.createVote(context, data);
      return createdVote;
    },
    deleteVote: async (parent, { where }, context) => {
      return context.DAOs.voteDAO.deleteVote(context, where);
    },
    updateVote: async (parent, { data, where = {} }, context) => {
      const updateVote = await context.DAOs.voteDAO.updateVote(context, { data, where });
      return updateVote;
    }
  },
  Vote: {
    minister: async (parent, args, context) => {
      return context.DAOs.voteDAO.getRelatedEntity(parent.id, 'minister', context);
    }
  }
};
