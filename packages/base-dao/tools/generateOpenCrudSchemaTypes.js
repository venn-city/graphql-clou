const { parseInternalTypes, generateCRUDSchemaFromInternalISDL } = require('@venncity/prisma-generate-schema');
const { plugin } = require('@graphql-codegen/typescript');
const { codegen } = require('@graphql-codegen/core');
const { printSchema, parse, GraphQLID, GraphQLNonNull } = require('graphql');

function generateOpenCrudSchemaTypes(dataModel) {
  const schema = generateSchema(dataModel);

  return codegen({
    schema,
    config: {
      namingConvention: {
        typeNames: 'change-case#pascalCase',
        enumValues: 'change-case#upperCase',
        transformUnderscore: true
      }
    },
    plugins: [{ typescript: {} }],
    documents: [],
    pluginMap: {
      typescript: { plugin }
    }
  });
}

function generateSchema(dataModel) {
  const sdl = parseInternalTypes(dataModel, 'postgres');
  const schema = generateCRUDSchemaFromInternalISDL(sdl, 'postgres');

  sdl.types.forEach(({ isEnum, fields, name: entityName }) => {
    if (isEnum) {
      return;
    }
    const schemaFileds = schema.getType(entityName).getFields();

    fields.forEach(({ relatedField, isRequired, isList, name: filedName }) => {
      if (relatedField === null || isList) {
        return;
      }
      // add additional id filed
      schemaFileds[`${filedName}Id`] = {
        name: `${filedName}Id`,
        args: [],
        type: isRequired ? new GraphQLNonNull(GraphQLID) : GraphQLID
      };
    });
  });

  return parse(printSchema(schema));
}

module.exports = generateOpenCrudSchemaTypes;
