const generateCRUDSchema = require('@venncity/prisma-generate-schema');

function generateOpenCrudSchemaGraphql(dataModel) {
  return generateCRUDSchema.default(dataModel);
}

module.exports = generateOpenCrudSchemaGraphql;
