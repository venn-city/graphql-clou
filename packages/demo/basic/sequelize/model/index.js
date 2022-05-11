const governmentModel = require('./government-model');
const ministerModel = require('./minister-model');
const ministryModel = require('./ministry-model');
const voteModel = require('./vote-model');
const lobbyistModel = require('./lobbyist-model');

module.exports = {
  Government: governmentModel,
  Minister: ministerModel,
  Ministry: ministryModel,
  Vote: voteModel,
  Lobbyist: lobbyistModel
};
