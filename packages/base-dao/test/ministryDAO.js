const baseDAO = require('./../src/baseDAO');
const daoAuth = require('./auth/daoAuth');
const { publishCrudEvent } = require('./publishCRUD/crudPublish');

// eslint-disable-next-line no-unused-vars
function buildAuthContext(context) {
  return {};
}

// eslint-disable-next-line no-unused-vars
async function getAuthDataFromDB(context, ministryId) {
  return {};
}

function createMinistryDAO() {
  const ministryDAO = baseDAO.createEntityDAO({ entityName: 'ministry', hooks, daoAuth, publishCrudEvent });
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

module.exports = createMinistryDAO;
