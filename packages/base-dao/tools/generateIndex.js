const ejs = require('ejs');
const path = require('path');

function generateIndex(daoClassNames) {
  return ejs.renderFile(path.resolve(__dirname, 'templates/index.ejs'), {
    daoClassNames
  });
}

module.exports = generateIndex;
