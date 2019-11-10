function getQueryWhereInputName(context, fieldName) {
  const whereInputType = context.openCrudIntrospection.types
    .find(t => t.name === 'Query')
    .fields.find(f => f.name === fieldName)
    .args.find(a => a.name === 'where').type;
  return whereInputType.name || whereInputType.ofType.name;
}

function getMutationWhereInputName(context, fieldName) {
  const whereInputType = context.openCrudIntrospection.types
    .find(t => t.name === 'Mutation')
    .fields.find(f => f.name === fieldName)
    .args.find(a => a.name === 'where').type;
  return whereInputType.name || whereInputType.ofType.name;
}

function getFieldType(field) {
  return (field.type.kind === KINDS.LIST && field.type.ofType.ofType.name) || field.type.name || (field.type.ofType && field.type.ofType.name);
}

const KINDS = {
  SCALAR: 'SCALAR',
  ENUM: 'ENUM',
  LIST: 'LIST',
  OBJECT: 'OBJECT'
};

module.exports = {
  getMutationWhereInputName,
  getQueryWhereInputName,
  getFieldType
};
