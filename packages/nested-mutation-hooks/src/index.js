const { preCreation, postCreation } = require('./resolverHooks/creationHooks');
const { preUpdate, postUpdate } = require('./resolverHooks/updateHooks');

module.exports = {
  preCreation,
  postCreation,
  preUpdate,
  postUpdate
};
