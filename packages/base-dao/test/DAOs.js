const createGovernmentDAO = require('./governmentDAO');

function createAllDAOs() {
  const allDAOs = {
    governmentDAO: createGovernmentDAO()
  };

  return allDAOs;
}

module.exports = createAllDAOs;
