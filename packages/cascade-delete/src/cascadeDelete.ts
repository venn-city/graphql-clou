import { upperFirst, lowerFirst, map, isEqual } from 'lodash';
import { sequelizeDataProvider } from '@venncity/sequelize-data-provider';

import util from 'util';
import async from 'async';
import pluralize from 'pluralize';
import introspectionUtils from '@venncity/opencrud-schema-provider';

const { getFieldType } = introspectionUtils;

const CASCADE_DIRECTIVE = 'vnCascade';
const DELETE_OPERATION = 'DELETE';
const DISCONNECT_OPERATION = 'DISCONNECT';
const DIRECT = 'direct';
const INVERSE = 'inverse';

export async function cascadeDelete({ entityName, entityId, context }: { entityName: string; entityId: string; context: any }) {
  await cascadeReferencedEntities(entityName, entityId, context);
  await cascadeReferencingEntities(entityName, entityId, context);
}

async function cascadeReferencedEntities(entityName: string, entityId: string, context: any) {
  const fieldsToCascade = getReferencedFieldsToCascade(context, entityName);

  await async.eachOf(fieldsToCascade, async (fieldToCascade: any) => {
    const fieldType = getFieldType(fieldToCascade);
    const { shouldDelete, shouldDisconnect } = getDirectiveOperations(fieldToCascade.directives, DIRECT);

    let entityIdToCascade = await sequelizeDataProvider.getRelatedEntityIds(entityName, entityId, fieldToCascade.name);
    if (entityIdToCascade) {
      if (!Array.isArray(entityIdToCascade)) {
        entityIdToCascade = [entityIdToCascade];
      }
      if (shouldDisconnect) {
        await async.eachOf(entityIdToCascade, async (idToCascade: any) => {
          if (shouldDelete) {
            await runPreDeletionOfNextEntity(fieldType, idToCascade, context);
          }
          await performDisconnect(entityName, entityId, idToCascade, fieldToCascade, context);
        });
      }

      if (shouldDelete) {
        await deleteMany(fieldType, entityIdToCascade, context);
      }
    }
  });
}

async function runPreDeletionOfNextEntity(fieldType: string, idToCascade: any, context: any) {
  idToCascade = idToCascade.id || idToCascade;
  const joinEntityDAOhooks = await context.DAOs[`${lowerFirst(fieldType)}DAO`].getHooks();
  await joinEntityDAOhooks.preDelete(context, { id: idToCascade });
}

async function cascadeReferencingEntities(originalEntityName: string, originalEntityId: string, context: any) {
  const allEntitiesTypes = context.openCrudDataModel.types;
  await async.eachOf(allEntitiesTypes, async (entity: any) => {
    const entityFields = entity.fields;

    const fieldsToCascade = getReferencingFieldsToCascade(entityFields, originalEntityName);

    if (fieldsToCascade.length) {
      const referencingEntityName = entity.name;
      await handleReferencingEntities(originalEntityName, referencingEntityName, originalEntityId, fieldsToCascade, context);
    }
  });
}

async function handleReferencingEntities(
  originalEntityName: string,
  referencingEntityName: string,
  originalEntityId: string,
  fieldsToCascade: any,
  context: any
) {
  await async.eachOf(fieldsToCascade, async (fieldToCascade: any) => {
    let where;

    if (fieldToCascade.isList) {
      where = {
        [`${fieldToCascade.name}_some`]: { id: originalEntityId }
      };
    } else {
      where = {
        [fieldToCascade.name]: { id: originalEntityId }
      };
    }
    const entityIdsToCascade = map(await sequelizeDataProvider.getAllEntities(referencingEntityName, { where }), 'id');

    if (entityIdsToCascade.length) {
      const { shouldDelete, shouldDisconnect } = getDirectiveOperations(fieldToCascade.directives, INVERSE);
      if (shouldDisconnect) {
        await async.eachOf(entityIdsToCascade, async (entityIdToCascade: string) => {
          if (shouldDelete) {
            await runPreDeletionOfNextEntity(referencingEntityName, entityIdToCascade, context);
          }
          await performDisconnect(referencingEntityName, entityIdToCascade, originalEntityId, fieldToCascade, context);
        });
      }
      if (shouldDelete) {
        await deleteMany(referencingEntityName, entityIdsToCascade, context);
      }
    }
  });
}

async function deleteMany(fieldType: string, idsToDelete: any[], context: any) {
  const joinFieldDAO = context.DAOs[`${lowerFirst(fieldType)}DAO`];
  await joinFieldDAO[`deleteMany${pluralize(fieldType)}`](context, {
    id_in: idsToDelete.map(idToDelete => idToDelete.id || idToDelete)
  });
}

async function performDisconnect(entityName: string, entityId: any, entityIdToDisconnect: string, fieldToDisconnect: any, context: any) {
  entityIdToDisconnect = entityIdToDisconnect.id || entityIdToDisconnect;
  entityId = entityId.id || entityId;
  const entityDAO = context.DAOs[`${lowerFirst(entityName)}DAO`];
  const disconnect = fieldToDisconnect.isList ? { id: entityIdToDisconnect } : true;

  await entityDAO[`update${upperFirst(entityName)}`](context, {
    data: {
      [fieldToDisconnect.name]: { disconnect }
    },
    where: { id: entityId }
  });
}

function getDirectiveOperations(directives: any, direction: any) {
  const cascadeOperations = directives.find(d => isEqual(d.name, CASCADE_DIRECTIVE)).arguments[direction];
  const shouldDelete = cascadeOperations.includes(DELETE_OPERATION);
  const shouldDisconnect = cascadeOperations.includes(DISCONNECT_OPERATION);
  return { shouldDelete, shouldDisconnect };
}

function getReferencedFieldsToCascade(context: any, entityName: string) {
  const entityFields = context.openCrudDataModel.types.find((t: any) => t.name === upperFirst(entityName)).fields;
  return entityFields.filter((f: any) =>
    f.directives.find((d: any) => {
      return _.isEqual(d.name, CASCADE_DIRECTIVE) && d.arguments.direct;
    })
  );
}

function getReferencingFieldsToCascade(entityFields: string[], originalEntityName: string) {
  return entityFields.filter((f: any) => {
    if (lowerFirst(getFieldType(f)) === originalEntityName) {
      return f.directives.some(d => isEqual(d.name, CASCADE_DIRECTIVE) && d.arguments.inverse);
    }
    return false;
  });
}
