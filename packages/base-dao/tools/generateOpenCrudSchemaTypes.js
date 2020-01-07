const { parseInternalTypes, generateCRUDSchemaFromInternalISDL } = require('prisma-generate-schema');
const { plugin } = require('@graphql-codegen/typescript');
const { codegen } = require('@graphql-codegen/core');
const { printSchema, parse, GraphQLID, GraphQLNonNull } = require('graphql');

function generateOpenCrudSchemaTypes(dataModel) {
  const schema = generateSchema(dataModel);

  return codegen({
    schema,
    plugins: [{ typescript: {} }],
    documents: [],
    pluginMap: {
      typescript: { plugin }
    }
  });
}

function generateSchema(dataModel) {
  const sdl = parseInternalTypes(dataModel, 'postgres');
  const missigFields = {};

  sdl.types.forEach(({ isEnum, fields, name: entityName }) => {
    if (isEnum) {
      return;
    }
    missigFields[entityName] = [];
    fields.forEach(({ relatedField, isRequired, isList, name: filedName }) => {
      if (relatedField === null || isList) {
        return;
      }
      missigFields[entityName].push({
        name: `${filedName}Id`,
        isRequired
      });
    });
  });

  const schema = generateCRUDSchemaFromInternalISDL(sdl, 'postgres');

  Object.keys(missigFields).forEach(entityName => {
    const missigFieldsByEntity = missigFields[entityName];
    const fields = schema.getType('SurveyQuestion').getFields();

    missigFieldsByEntity.forEach(({ name, isRequired }) => {
      fields[name] = {
        name,
        args: [],
        type: isRequired ? new GraphQLNonNull(GraphQLID) : GraphQLID
      };
    });
  });

  return parse(printSchema(schema));
}

module.exports = generateOpenCrudSchemaTypes;
