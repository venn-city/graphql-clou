const governmentModel = require('./government-model');
const ministerModel = require('./minister-model');
const ministryModel = require('./ministry-model');
const voteModel = require('./vote-model');

module.exports = {
  Government: governmentModel,
  Minister: ministerModel,
  Ministry: ministryModel,
  Vote: voteModel
};
