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
      return context.DAOs.voteDAO.createVote(context, data);
    },
    deleteVote: async (parent, { where }, context) => {
      return context.DAOs.voteDAO.deleteVote(context, where);
    },
    updateVote: async (parent, { data, where = {} }, context) => {
      return context.DAOs.voteDAO.updateVote(context, { data, where });
    }
  },
  Vote: {
    minister: async (parent, args, context) => {
      return context.DAOs.voteDAO.getRelatedEntity(parent.id, 'minister', context);
    }
  }
};
