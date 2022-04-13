import { preCreation, postCreation, preUpdate, postUpdate } from '../../../../nestedMutationHooks';

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
      const postCreationCalls = await preCreation(context, data, 'Vote');
      const createdVote = await context.DAOs.voteDAO.createVote(context, data);
      await postCreation(postCreationCalls, createdVote);
      return createdVote;
    },
    deleteVote: async (parent, { where }, context) => {
      return context.DAOs.voteDAO.deleteVote(context, where);
    },
    updateVote: async (parent, { data, where = {} }, context) => {
      const postUpdateCalls = await preUpdate(context, data, where, 'Vote');
      const updateVote = await context.DAOs.voteDAO.updateVote(context, { data, where });
      await postUpdate(postUpdateCalls, updateVote);
      return updateVote;
    }
  },
  Vote: {
    minister: async (parent, args, context) => {
      return context.DAOs.voteDAO.getRelatedEntity(parent.id, 'minister', context);
    }
  }
};
