const path = require('path');
const { importSchema } = require('graphql-import');
const ejs = require('ejs');

async function generateWhiteListOpenCrudSchemaGraphql(whiteListFilePath) {
  const schema = await importSchema(whiteListFilePath);
  return ejs.renderFile(path.resolve(__dirname, 'templates/whiteListSchema.ejs'), {
    schema
  });
}

module.exports = generateWhiteListOpenCrudSchemaGraphql;
