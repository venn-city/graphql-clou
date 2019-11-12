const _ = require('lodash');
const util = require('util');
const async = require('async');
const { upperFirst, lowerFirst } = require('lodash');
const pluralize = require('pluralize');
const { sequelizeDataProvider } = require('@venncity/sequelize-data-provider');
const { getFieldType } = require('@venncity/opencrud-schema-provider').introspectionUtils;

const eachOfAsync = util.promisify(async.eachOf);

const CASCADE_DIRECTIVE = 'vnCascade';
const DELETE_OPERATION = 'DELETE';
const DISCONNECT_OPERATION = 'DISCONNECT';
const DIRECT = 'direct';
const INVERSE = 'inverse';

async function cascadeDelete({ entityName, entityId, context }) {
  await cascadeReferencedEntities(entityName, entityId, context);
  await cascadeReferencingEntities(entityName, entityId, context);
}

async function cascadeReferencedEntities(entityName, entityId, context) {
  const fieldsToCascade = getReferencedFieldsToCascade(context, entityName);

  await eachOfAsync(fieldsToCascade, async fieldToCascade => {
    const fieldType = getFieldType(fieldToCascade);
    const { shouldDelete, shouldDisconnect } = getDirectiveOperations(fieldToCascade.directives, DIRECT);

    let entityIdToCascade = await sequelizeDataProvider.getRelatedEntityIds(entityName, entityId, fieldToCascade.name);
    if (entityIdToCascade) {
      if (!Array.isArray(entityIdToCascade)) {
        entityIdToCascade = [entityIdToCascade];
      }
      if (shouldDisconnect) {
        await eachOfAsync(entityIdToCascade, async idToCascade => {
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

async function runPreDeletionOfNextEntity(fieldType, idToCascade, context) {
  idToCascade = idToCascade.id || idToCascade;
  const joinEntityDAOhooks = await context.DAOs[`${lowerFirst(fieldType)}DAO`].getHooks();
  await joinEntityDAOhooks.preDelete(context, { id: idToCascade });
}

async function cascadeReferencingEntities(originalEntityName, originalEntityId, context) {
  const allEntitiesTypes = context.openCrudDataModel.types;
  await eachOfAsync(allEntitiesTypes, async entity => {
    const entityFields = entity.fields;

    const fieldsToCascade = getReferencingFieldsToCascade(entityFields, originalEntityName);

    if (fieldsToCascade.length) {
      const referencingEntityName = entity.name;
      await handleReferencingEntities(originalEntityName, referencingEntityName, originalEntityId, fieldsToCascade, context);
    }
  });
}

async function handleReferencingEntities(originalEntityName, referencingEntityName, originalEntityId, fieldsToCascade, context) {
  await eachOfAsync(fieldsToCascade, async fieldToCascade => {
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
    const entityIdsToCascade = _.map(await sequelizeDataProvider.getAllEntities(referencingEntityName, { where }), 'id');

    if (entityIdsToCascade.length) {
      const { shouldDelete, shouldDisconnect } = getDirectiveOperations(fieldToCascade.directives, INVERSE);
      if (shouldDisconnect) {
        await eachOfAsync(entityIdsToCascade, async entityIdToCascade => {
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

async function deleteMany(fieldType, idsToDelete, context) {
  const joinFieldDAO = context.DAOs[`${lowerFirst(fieldType)}DAO`];
  await joinFieldDAO[`deleteMany${pluralize(fieldType)}`](context, {
    id_in: idsToDelete.map(idToDelete => idToDelete.id || idToDelete)
  });
}

async function performDisconnect(entityName, entityId, entityIdToDisconnect, fieldToDisconnect, context) {
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

function getDirectiveOperations(directives, direction) {
  const cascadeOperations = directives.find(d => _.isEqual(d.name, CASCADE_DIRECTIVE)).arguments[direction];
  const shouldDelete = cascadeOperations.includes(DELETE_OPERATION);
  const shouldDisconnect = cascadeOperations.includes(DISCONNECT_OPERATION);
  return { shouldDelete, shouldDisconnect };
}

function getReferencedFieldsToCascade(context, entityName) {
  const entityFields = context.openCrudDataModel.types.find(t => t.name === upperFirst(entityName)).fields;
  return entityFields.filter(f =>
    f.directives.find(d => {
      return _.isEqual(d.name, CASCADE_DIRECTIVE) && d.arguments.direct;
    })
  );
}

function getReferencingFieldsToCascade(entityFields, originalEntityName) {
  return entityFields.filter(f => {
    if (lowerFirst(getFieldType(f)) === originalEntityName) {
      return f.directives.some(d => _.isEqual(d.name, CASCADE_DIRECTIVE) && d.arguments.inverse);
    }
    return false;
  });
}

module.exports = {
  cascadeDelete,
  getDirectiveOperations,
  getReferencedFieldsToCascade,
  getReferencingFieldsToCascade
};
