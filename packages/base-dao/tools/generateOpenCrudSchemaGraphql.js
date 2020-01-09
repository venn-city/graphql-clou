const { generateCRUDSchema } = require('prisma-generate-schema');
const { printSchema } = require('graphql');

function generateOpenCrudSchemaGraphql(dataModel) {
  const schema = generateCRUDSchema(dataModel, 'postgres');
  return printSchema(schema);
}

module.exports = generateOpenCrudSchemaGraphql;
