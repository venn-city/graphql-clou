const eventPubSub = require('@venncity/event-pubsub');
const _ = require('lodash');

const ENTITY_CRUD_TOPIC_NAME = 'entity-crud';

async function publishCrudEvent({ entityName, operation, entityBefore, entityAfter, context }) {
  const entityNameUpperSnake = toUpperSnakeCase(entityName);
  const { requestAdditionalInfo } = context;

  const messageAttributes = {
    entityType: entityNameUpperSnake,
    eventType: operation
  };
  const message = {
    entityType: entityNameUpperSnake,
    eventType: operation,
    entityBefore,
    entityAfter,
    authData: buildAuthDataForPublishingEvent(context),
    requestAdditionalInfo
  };

  await internalPublish(message, messageAttributes);
}

async function internalPublish(message, messageAttributes) {
  if (process.env.IS_LOCAL_DB === 'true' || process.env.IS_TEST === 'true') {
    // dont publish for localhost test runs
    return;
  }

  eventPubSub
    .publish({
      eventType: ENTITY_CRUD_TOPIC_NAME,
      message: JSON.stringify(message),
      messageAttributes
    })
    .catch(e => {
      console.error('Failed publishing crud event to entityCrud topic. Message: ', message, e);
    });
}

function buildAuthDataForPublishingEvent({ auth }) {
  return {
    id: auth.id,
    isService: !!auth.isService,
    isPublicAccess: !!auth.isPublicAccess
  };
}

function toUpperSnakeCase(str) {
  return _.snakeCase(str).toUpperCase();
}

module.exports = { publishCrudEvent };
