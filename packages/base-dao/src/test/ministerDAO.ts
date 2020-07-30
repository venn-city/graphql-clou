import baseDAO from '../baseDAO';
import { daoAuth } from './auth/daoAuth';
import { publishCrudEvent } from './publishCRUD/crudPublish';

// eslint-disable-next-line no-unused-vars
function buildAuthContext(context) {
  return {};
}

// eslint-disable-next-line no-unused-vars
async function getAuthDataFromDB(context, ministerId) {
  return {};
}

function createMinisterDAO() {
  const ministerDAO = baseDAO.createEntityDAO({ entityName: 'minister', hooks, daoAuth, publishCrudEvent });
  return {
    ...ministerDAO
  };
}

async function preSave(minister) {
  return minister;
}

async function postFetch(minister) {
  return minister;
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

export default createMinisterDAO;
