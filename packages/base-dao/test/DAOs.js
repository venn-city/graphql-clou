const createGovernmentDAO = require('./governmentDAO');
const createMinistryDAO = require('./ministryDAO');

function createAllDAOs() {
  const allDAOs = {
    governmentDAO: createGovernmentDAO(),
    ministryDAO: createMinistryDAO()
  };

  return allDAOs;
}

module.exports = createAllDAOs;
