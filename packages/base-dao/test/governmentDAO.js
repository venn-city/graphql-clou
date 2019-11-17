const baseDAO = require('./../src/baseDAO');
const daoAuth = require('./auth/daoAuth');
const { publishCrudEvent } = require('./publishCRUD/crudPublish');

// eslint-disable-next-line no-unused-vars
function buildAuthContext(context) {
  return {};
}

// eslint-disable-next-line no-unused-vars
async function getAuthDataFromDB(context, governmentId) {
  return {};
}

function createGovernmentDAO() {
  const governmentDAO = baseDAO.createEntityDAO({ entityName: 'government', hooks, daoAuth, publishCrudEvent });
  return {
    ...governmentDAO
  };
}

async function preSave(government) {
  return government;
}

async function postFetch(government) {
  return government;
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

module.exports = createGovernmentDAO;
