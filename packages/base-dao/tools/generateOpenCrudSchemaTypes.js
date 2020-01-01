const prismaGenerateSchema = require('prisma-generate-schema');
const { plugin } = require('@graphql-codegen/typescript');
const { codegen } = require('@graphql-codegen/core');
const { printSchema, parse } = require('graphql');

function generateOpenCrudSchemaTypes(dataModel) {
  const openCRUDSchema = prismaGenerateSchema.generateCRUDSchema(dataModel, 'postgres');

  return codegen({
    schema: parse(printSchema(openCRUDSchema)),
    plugins: [{ typescript: {} }],
    documents: [],
    pluginMap: {
      typescript: { plugin }
    }
  });
}

module.exports = generateOpenCrudSchemaTypes;
