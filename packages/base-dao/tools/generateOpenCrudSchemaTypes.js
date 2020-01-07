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

  const missigFieldsByEntities = sdl.types.reduce((prevFiledsByEntities, { isEnum, fields, name: entityName }) => {
    if (isEnum) {
      return prevFiledsByEntities;
    }
    return {
      ...prevFiledsByEntities,
      [entityName]: fields.reduce((prevFields, { relatedField, isRequired, isList, name: filedName }) => {
        if (relatedField === null || isList) {
          return prevFields;
        }
        return [
          ...prevFields,
          {
            name: `${filedName}Id`,
            isRequired
          }
        ];
      }, [])
    };
  }, {});

  const schema = generateCRUDSchemaFromInternalISDL(sdl, 'postgres');

  Object.keys(missigFieldsByEntities).forEach(entityName => {
    const missigFieldsByEntity = missigFieldsByEntities[entityName];
    const fields = schema.getType(entityName).getFields();

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
