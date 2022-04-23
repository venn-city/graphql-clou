import baseDAO from '../../../../src/baseDAO';
import { mockDaoAuth } from '../../types/authTypes';

// eslint-disable-next-line no-unused-vars
function buildAuthContext(context) {
  return {};
}

// eslint-disable-next-line no-unused-vars
async function getAuthDataFromDB(context, ministryId) {
  return {};
}

function createMinistryDAO() {
  const ministryDAO = baseDAO.createEntityDAO({ entityName: 'ministry', hooks, daoAuth: mockDaoAuth, publishCrudEvent: () => {} });
  return {
    ...ministryDAO
  };
}

async function preSave(ministry) {
  return ministry;
}

async function postFetch(ministry) {
  return ministry;
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

export default createMinistryDAO;
