import asyncRunner from 'async';
import { promisify } from 'util';
import { lowerFirst } from 'lodash';

import opencrudSchemaProvider from '@venncity/opencrud-schema-provider';
import {
  getChildEntityCreateResolver,
  getChildEntityUpdateResolver,
  getChildEntityDeleteResolver,
  detectChildFieldsToChange,
  isReferencingSideOfJoin
} from './common';

const { getChildFieldOfType, getFieldName, getFieldType, extractFieldMetadata, KINDS } = opencrudSchemaProvider.introspectionUtils;

const each = promisify(asyncRunner.each);

export async function preUpdate(context, parentUpdateData, where, entityName) {
  const postUpdateCalls = [];
  const { parentEntityMetadata, childFieldsToChangeMetadata } = detectChildFieldsToChange(context, entityName, parentUpdateData);
  await each(childFieldsToChangeMetadata, async childFieldToChange => {
    const { fieldName, fieldKind } = extractFieldMetadata(childFieldToChange);
    const childEntityData = parentUpdateData[fieldName];
    if (!childEntityData) return;

    switch (fieldKind) {
      case KINDS.OBJECT:
        if (childEntityData.create) {
          postUpdateCalls.push(await nestedCreate({ context, childFieldToChange, entityName, parentEntityMetadata, where, parentUpdateData }));
        } else if (childEntityData.connect) {
          await nestedConnect({ context, childFieldToChange, entityName, parentEntityMetadata, where, parentUpdateData });
        } else if (childEntityData.update) {
          await nestedUpdate({ context, childFieldToChange, entityName, parentEntityMetadata, where, parentUpdateData });
        } else if (childEntityData.delete) {
          postUpdateCalls.push(await nestedDelete({ context, childFieldToChange, entityName, parentEntityMetadata, where, parentUpdateData }));
        } else if (childEntityData.disconnect) {
          await nestedDisconnect({ context, childFieldToChange, entityName, parentEntityMetadata, where, parentUpdateData });
        } else {
          console.warn('Unexpected operation', childEntityData, 'in', parentUpdateData);
        }
        break;
      case KINDS.LIST:
        if (childEntityData.create) {
          childEntityData.create = [].concat(childEntityData.create);
          await each(childEntityData.create, async childFieldToChangeElement => {
            postUpdateCalls.push(
              await nestedCreate({
                context,
                childFieldToChange,
                entityName,
                parentEntityMetadata,
                where,
                parentUpdateData,
                childElementData: childFieldToChangeElement
              })
            );
          });
          delete parentUpdateData[fieldName].create;
        }
        if (childEntityData.connect) {
          childEntityData.connect = [].concat(childEntityData.connect);
          await each(childEntityData.connect, async childFieldToChangeElement => {
            await nestedConnect({
              context,
              childFieldToChange,
              entityName,
              parentEntityMetadata,
              where,
              parentUpdateData,
              childElementData: childFieldToChangeElement
            });
          });
        }
        if (childEntityData.update) {
          childEntityData.update = [].concat(childEntityData.update);
          await each(childEntityData.update, async childFieldToChangeElement => {
            await nestedUpdate({
              context,
              childFieldToChange,
              entityName,
              parentEntityMetadata,
              where,
              parentUpdateData,
              childElementData: childFieldToChangeElement
            });
          });
        }
        if (childEntityData.delete) {
          childEntityData.delete = [].concat(childEntityData.delete);
          await each(childEntityData.delete, async childFieldToChangeElement => {
            postUpdateCalls.push(
              await nestedDelete({
                context,
                childFieldToChange,
                entityName,
                parentEntityMetadata,
                where,
                parentUpdateData,
                childElementData: childFieldToChangeElement
              })
            );
          });
        }
        if (childEntityData.deleteMany) {
          childEntityData.deleteMany = [].concat(childEntityData.deleteMany);
          await each(childEntityData.deleteMany, async childFieldToChangeElement => {
            await nestedDelete({
              context,
              childFieldToChange,
              entityName,
              parentEntityMetadata,
              where,
              parentUpdateData,
              childElementData: childFieldToChangeElement
            });
          });
        }
        if (childEntityData.updateMany) {
          childEntityData.updateMany = [].concat(childEntityData.updateMany);
          await each(childEntityData.updateMany, async childFieldToChangeElement => {
            await nestedUpdate({
              context,
              childFieldToChange,
              entityName,
              parentEntityMetadata,
              where,
              parentUpdateData,
              childElementData: childFieldToChangeElement
            });
          });
        }
        if (childEntityData.disconnect) {
          childEntityData.disconnect = [].concat(childEntityData.disconnect);
          await each(childEntityData.disconnect, async childFieldToChangeElement => {
            await nestedDisconnect({
              context,
              childFieldToChange,
              entityName,
              parentEntityMetadata,
              where,
              parentUpdateData,
              childElementData: childFieldToChangeElement
            });
          });
        }
        if (childEntityData.upsert) {
          throw new Error('Nested upsert actions are not supported');
        }
        break;
      default:
      // do nothing
    }
  });
  return postUpdateCalls;
}

async function nestedCreate({ context, childFieldToChange, entityName, parentEntityMetadata, parentUpdateData, childElementData }) {
  const { fieldName, fieldType } = extractFieldMetadata(childFieldToChange);
  const childEntityCreateResolver = getChildEntityCreateResolver(context, fieldType);
  const childCreationData = parentUpdateData[fieldName];
  const childData = childElementData || childCreationData.create;
  if (isReferencingSideOfJoin(context, entityName, childFieldToChange)) {
    delete childCreationData.create;
    const createdChild = await childEntityCreateResolver(parentUpdateData, { data: childData }, context);
    childCreationData.connect = { id: createdChild.id };
    return null;
  }
  // eslint-disable-line no-else-return
  if (!childElementData) {
    delete childCreationData.create;
  }
  const reverseReferenceFieldMetadata = getChildFieldOfType(childFieldToChange, getFieldType(parentEntityMetadata), context.openCrudIntrospection);
  return async entityId => {
    return childEntityCreateResolver(
      parentUpdateData,
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

async function nestedConnect({ context, childFieldToChange, entityName, parentEntityMetadata, where, parentUpdateData, childElementData }) {
  const { fieldName, fieldType } = extractFieldMetadata(childFieldToChange);
  if (isReferencingSideOfJoin(context, entityName, childFieldToChange)) {
    // do nothing, leaving the connect as is.
  } else {
    const childData = childElementData || parentUpdateData[fieldName].connect;
    const fetchedEntity = await context.dataProvider.getEntity(lowerFirst(getFieldName(parentEntityMetadata)), where);
    const ownerId = childData.id;
    delete parentUpdateData[fieldName];
    const reverseReferenceFieldMetadata = getChildFieldOfType(childFieldToChange, getFieldType(parentEntityMetadata), context.openCrudIntrospection);
    const reverseReferenceData = { [getFieldName(reverseReferenceFieldMetadata)]: { connect: { id: fetchedEntity.id } } };
    const updateChildEntity = getChildEntityUpdateResolver(context, fieldType);
    await updateChildEntity(parentUpdateData, { data: reverseReferenceData, where: { id: ownerId } }, context);
  }
}

async function nestedUpdate({ context, childFieldToChange, parentEntityMetadata, where, parentUpdateData, childElementData }) {
  const { fieldName, fieldType } = extractFieldMetadata(childFieldToChange);
  const childEntityIds = [].concat(
    childElementData
      ? await fetchChildEntityIds(context.dataProvider, parentEntityMetadata, where, fieldName, childElementData.where)
      : await fetchChildEntityId(context.dataProvider, parentEntityMetadata, where, fieldName)
  );
  await each(childEntityIds, async childEntityId => {
    const updateChildEntity = getChildEntityUpdateResolver(context, fieldType);
    const childData = childElementData ? childElementData.data : parentUpdateData[fieldName].update;
    delete parentUpdateData[fieldName].update;
    await updateChildEntity(parentUpdateData, { data: childData, where: { id: childEntityId } }, context);
  });
}

async function nestedDelete({ context, childFieldToChange, entityName, parentEntityMetadata, where, parentUpdateData, childElementData }) {
  const { fieldName, fieldType } = extractFieldMetadata(childFieldToChange);
  const childEntityIds = [].concat(
    childElementData
      ? await fetchChildEntityIds(context.dataProvider, parentEntityMetadata, where, fieldName, childElementData.where)
      : await fetchChildEntityId(context.dataProvider, parentEntityMetadata, where, fieldName)
  );
  if (isReferencingSideOfJoin(context, entityName, childFieldToChange)) {
    delete parentUpdateData[fieldName].delete;
    parentUpdateData[fieldName] = buildDisconnectArgument(childFieldToChange, childEntityIds);
    return async () => {
      await each(childEntityIds, async childEntityId => {
        const deleteChildEntity = getChildEntityDeleteResolver(context, fieldType);
        await deleteChildEntity(parentUpdateData, { where: { id: childEntityId } }, context);
      });
    };
  }
  delete parentUpdateData[fieldName];
  return each(childEntityIds, async childEntityId => {
    const deleteChildEntity = getChildEntityDeleteResolver(context, fieldType);
    await deleteChildEntity(parentUpdateData, { where: { id: childEntityId } }, context);
  });
}

function buildDisconnectArgument(childFieldToChange, childEntityIds) {
  const data = {};
  data.disconnect = true;
  if (childFieldToChange.type.kind === 'LIST') {
    data.disconnect = [];
    childEntityIds.forEach(entityId => data.disconnect.push({ id: entityId }));
  }
  return data;
}

async function nestedDisconnect({ context, entityName, childFieldToChange, parentEntityMetadata, where, parentUpdateData, childElementData }) {
  const { fieldName, fieldType } = extractFieldMetadata(childFieldToChange);
  if (isReferencingSideOfJoin(context, entityName, childFieldToChange)) {
    // do nothing, leaving the disconnect as is.
  } else {
    const ownerId = childElementData ? childElementData.id : await fetchChildEntityId(context.dataProvider, parentEntityMetadata, where, fieldName);
    delete parentUpdateData[fieldName];
    const reverseReferenceFieldMetadata = getChildFieldOfType(childFieldToChange, getFieldType(parentEntityMetadata), context.openCrudIntrospection);
    const reverseReferenceData = { [getFieldName(reverseReferenceFieldMetadata)]: { disconnect: true } };
    const updateChildEntity = getChildEntityUpdateResolver(context, fieldType);
    await updateChildEntity(parentUpdateData, { data: reverseReferenceData, where: { id: ownerId } }, context);
  }
}

async function fetchChildEntityId(dataProvider, parentEntityMetadata, where, fieldName) {
  const fetchedEntity = await dataProvider.getEntity(lowerFirst(getFieldName(parentEntityMetadata)), where);
  return dataProvider.getRelatedEntityId(getFieldName(parentEntityMetadata), fetchedEntity.id, fieldName);
}

async function fetchChildEntityIds(dataProvider, parentEntityMetadata, where, fieldName, nestedWhere) {
  const fetchedEntity = await dataProvider.getEntity(lowerFirst(getFieldName(parentEntityMetadata)), where);
  const relatedEntityWhere = nestedWhere === true ? undefined : { where: nestedWhere };
  return dataProvider.getRelatedEntityIds(getFieldName(parentEntityMetadata), fetchedEntity.id, fieldName, relatedEntityWhere);
}

export async function postUpdate(postUpdateCalls, updatedEntity) {
  await each(postUpdateCalls, async postUpdateCall => postUpdateCall && postUpdateCall(updatedEntity.id));
}
