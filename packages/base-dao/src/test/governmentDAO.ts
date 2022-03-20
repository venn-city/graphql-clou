import baseDAO from '../baseDAO';
import { randomValuesByType } from './baseTestForDAOs';
import { mockDaoAuth } from './authTypes';

// eslint-disable-next-line no-unused-vars
function buildAuthContext(context) {
  return {};
}

// eslint-disable-next-line no-unused-vars
async function getAuthDataFromDB(context, governmentId) {
  return {};
}

function createGovernmentDAO() {
  const governmentDAO = baseDAO.createEntityDAO({ entityName: 'government', hooks, daoAuth: mockDaoAuth, publishCrudEvent: () => {} });
  return {
    ...governmentDAO
  };
}

async function preCreate(governement) {
  governement.name = governement.name || 'random_government';
  return governement;
}

async function postCreate(entityToCreate, creationResult) {
  return creationResult;
}

async function preSave(government) {
  if (government.name === 'preSave') {
    return { name: `${government.name}_${randomValuesByType('string')}` };
  }
  return government;
}

async function postFetch(government) {
  return government;
}

async function crudEventAdditionalInfo() {
  return { data: 'test' };
}

// eslint-disable-next-line no-unused-vars,no-empty-function
async function preDelete(context, where) {}

const hooks = {
  preSave,
  postFetch,
  preDelete,
  preCreate,
  postCreate,
  crudEventAdditionalInfo,
  authFunctions: {
    buildAuthContext,
    getAuthDataFromDB
  }
};

export default createGovernmentDAO;
