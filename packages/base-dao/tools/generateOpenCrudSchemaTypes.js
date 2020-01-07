const { parseInternalTypes, generateCRUDSchemaFromInternalISDL } = require('prisma-generate-schema');
const { plugin } = require('@graphql-codegen/typescript');
const { codegen } = require('@graphql-codegen/core');
const { printSchema, parse } = require('graphql');
const { cloneField } = require('prisma-datamodel');

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
  sdl.types.forEach(({ isEnum, fields }) => {
    if (isEnum) {
      return;
    }
    fields.forEach(({ relatedField, isRequired, isList, name }) => {
      if (relatedField === null || isList) {
        return;
      }
      const additionalIdField = generateAdditionalIdField(name, isRequired);
      fields.push(additionalIdField);
    });
  });
  const schema = generateCRUDSchemaFromInternalISDL(sdl, 'postgres');

  return parse(printSchema(schema));
}

function generateAdditionalIdField(originalFieldName, isRequired) {
  return cloneField({
    name: `${originalFieldName}Id`,
    relatedField: null,
    isList: false,
    type: 'ID',
    relationName: null,
    defaultValue: null,
    isUnique: false,
    isRequired,
    isId: true,
    idStrategy: null,
    associatedSequence: null,
    isUpdatedAt: false,
    isCreatedAt: false,
    isReadOnly: true,
    databaseName: null,
    directives: [],
    comments: []
  });
}

module.exports = generateOpenCrudSchemaTypes;
