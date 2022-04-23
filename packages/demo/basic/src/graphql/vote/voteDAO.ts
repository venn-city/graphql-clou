import baseDAO from '@venncity/base-dao';
import { mockDaoAuth } from '../../types/authTypes';

// eslint-disable-next-line no-unused-vars
function buildAuthContext(context) {
  return {};
}

// eslint-disable-next-line no-unused-vars
async function getAuthDataFromDB(context, voteId) {
  return {};
}

function createVoteDAO() {
  const voteDAO = baseDAO.createEntityDAO({ entityName: 'vote', hooks, daoAuth: mockDaoAuth, publishCrudEvent: () => {} });
  return {
    ...voteDAO
  };
}

async function preSave(vote) {
  return vote;
}

async function postFetch(vote) {
  return vote;
}

// eslint-disable-next-line no-unused-vars,no-empty-function
async function preDelete(context, where) {}

const hooks = {
  preSave,
  postFetch,
  preDelete,
  authFunctions: {
    buildAuthContext,
    getAuthDataFromDB
  }
};

export default createVoteDAO;
