import { get, keys } from 'lodash';
import opencrudSchemaProvider from '@venncity/opencrud-schema-provider';

const { findTypeInIntrospection, getChildFields, getFieldName } = opencrudSchemaProvider.introspectionUtils;

export function getChildEntityCreateResolver(context, fieldType) {
  return context.resolvers.Mutation[`create${fieldType}`];
}

export function getChildEntityUpdateResolver(context, fieldType) {
  return context.resolvers.Mutation[`update${fieldType}`];
}

export function getChildEntityDeleteResolver(context, fieldType) {
  return context.resolvers.Mutation[`delete${fieldType}`];
}

export function detectChildFieldsToChange(context, resource, data) {
  const introspection = context.openCrudIntrospection;
  const parentEntityMetadata = findTypeInIntrospection(introspection, resource);
  const childFieldsMetadata = getChildFields(parentEntityMetadata, introspection);
  const childFieldsToChangeMetadata = childFieldsMetadata.filter(childField => keys(data).includes(getFieldName(childField)));
  return { parentEntityMetadata, childFieldsToChangeMetadata };
}

export function isReferencingSideOfJoin(context, type, field) {
  const fieldMetadata = context.openCrudDataModel.types.find(t => t.name === type).fields.find(f => f.name === getFieldName(field));

  const isUsingRelationTable = !!fieldMetadata.relationName;
  if (isUsingRelationTable) {
    // When using a relation table there is no real "owner" of the join so we choose one arbitrarily
    return type < field.name;
  }
  const pgRelationDirective = fieldMetadata.directives.find(d => d.name === 'pgRelation');
  return get(pgRelationDirective, 'arguments.column') !== undefined;
}
