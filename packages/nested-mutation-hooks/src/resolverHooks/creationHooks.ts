import asyncRunner from 'async';
import { promisify } from 'util';
import openCrudSchemaProvider from '@venncity/opencrud-schema-provider';
import { getChildEntityCreateResolver, getChildEntityUpdateResolver, detectChildFieldsToChange, isReferencingSideOfJoin } from './common';

const { getChildFieldOfType, getFieldName, getFieldKind, getFieldType, extractFieldMetadata, KINDS } = openCrudSchemaProvider.introspectionUtil;

const each = promisify(asyncRunner.each);

export async function preCreation(context, parentCreationData, entityName) {
  const postCreationCalls = [];
  const { parentEntityMetadata, childFieldsToChangeMetadata } = detectChildFieldsToChange(context, entityName, parentCreationData);
  await each(childFieldsToChangeMetadata, async childFieldToChangeMetadata => {
    const childFieldName = getFieldName(childFieldToChangeMetadata);
    const childEntityData = parentCreationData[childFieldName];
    if (!childEntityData) return;

    switch (getFieldKind(childFieldToChangeMetadata)) {
      case KINDS.OBJECT:
        if (childEntityData.create) {
          postCreationCalls.push(await nestedCreate({ context, entityName, childFieldToChangeMetadata, parentCreationData, parentEntityMetadata }));
        } else if (childEntityData.connect) {
          postCreationCalls.push(await nestedConnect({ context, entityName, childFieldToChangeMetadata, parentCreationData, parentEntityMetadata }));
        } else {
          console.error('Unexpected operation', childEntityData, 'in', parentCreationData);
        }
        break;
      case KINDS.LIST:
        if (childEntityData.create) {
          await each(childEntityData.create, async childFieldToChangeElement => {
            postCreationCalls.push(
              // @ts-ignore
              await nestedCreate({
                context,
                entityName,
                childFieldToChangeMetadata,
                parentCreationData,
                parentEntityMetadata,
                childElementData: childFieldToChangeElement
              })
            );
          });
          delete childEntityData.create;
        } else if (childEntityData.connect) {
          await each(childEntityData.connect, async childFieldToChangeElement => {
            postCreationCalls.push(
              // @ts-ignore
              await nestedConnect({
                context,
                entityName,
                childFieldToChangeMetadata,
                parentCreationData,
                parentEntityMetadata,
                childElementData: childFieldToChangeElement
              })
            );
          });
        } else {
          console.error('Unexpected operation', childEntityData, 'in', parentCreationData);
        }
        break;
      default:
      // do nothing
    }
  });
  return postCreationCalls;
}

export async function postCreation(postCreationCalls, createdEntity) {
  await each(postCreationCalls, async postCreationCall => postCreationCall && postCreationCall(createdEntity.id));
}

async function nestedCreate({ context, entityName, childFieldToChangeMetadata, parentCreationData, parentEntityMetadata, childElementData }) {
  const { fieldName, fieldType } = extractFieldMetadata(childFieldToChangeMetadata);
  const childEntityCreateResolver = getChildEntityCreateResolver(context, fieldType);
  const childCreationData = parentCreationData[fieldName];
  const childData = childElementData || childCreationData.create;
  if (isReferencingSideOfJoin(context, entityName, childFieldToChangeMetadata)) {
    delete childCreationData.create;
    const createdChild = await childEntityCreateResolver(parentCreationData, { data: childData }, context);
    childCreationData.connect = { id: createdChild.id };
    return null;
  }
  // eslint-disable-line no-else-return
  if (!childElementData) {
    delete childCreationData.create;
  }
  const reverseReferenceFieldMetadata = getChildFieldOfType(
    childFieldToChangeMetadata,
    getFieldType(parentEntityMetadata),
    context.openCrudIntrospection
  );
  return async entityId => {
    return childEntityCreateResolver(
      parentCreationData,
      {
        data: {
          [getFieldName(reverseReferenceFieldMetadata)]: { connect: { id: entityId } },
          ...childData
        }
      },
      context
    );
  };
}

async function nestedConnect({ context, entityName, childFieldToChangeMetadata, parentCreationData, parentEntityMetadata, childElementData }) {
  const { fieldName, fieldType } = extractFieldMetadata(childFieldToChangeMetadata);
  const childEntityUpdateResolver = getChildEntityUpdateResolver(context, fieldType);
  const childConnectData = parentCreationData[fieldName];
  const childData = childElementData || childConnectData.connect;
  if (isReferencingSideOfJoin(context, entityName, childFieldToChangeMetadata)) {
    // do nothing, leaving the connect as is.
    return null;
  }
  const ownerId = childData.id;
  delete parentCreationData[fieldName];
  const reverseReferenceField = getChildFieldOfType(childFieldToChangeMetadata, getFieldType(parentEntityMetadata), context.openCrudIntrospection);
  return async entityId => {
    const reverseReferenceData = { [getFieldName(reverseReferenceField)]: { connect: { id: entityId } } };
    return childEntityUpdateResolver(parentCreationData, { data: reverseReferenceData, where: { id: ownerId } }, context);
  };
}
