// eslint-disable-next-line import/no-extraneous-dependencies
import eventPubSub from '@venncity/event-pubsub';
import _ from 'lodash';

const ENTITY_CRUD_TOPIC_NAME = 'entity-crud';

export async function publishCrudEvent({ entityName, operation, entityBefore, entityAfter, context }) {
  const entityNameUpperSnake = toUpperSnakeCase(entityName);
  const { requestAdditionalInfo } = context.requestAdditionalInfo ? context : { requestAdditionalInfo: undefined };

  const messageAttributes = {
    entityType: entityNameUpperSnake,
    eventType: operation
  };
  const message = {
    entityType: entityNameUpperSnake,
    eventType: operation,
    entityBefore,
    entityAfter,
    authData: context && buildAuthDataForPublishingEvent(context),
    requestAdditionalInfo
  };

  await internalPublish(message, messageAttributes);
}

async function internalPublish(message, messageAttributes) {
  if (process.env.IS_LOCAL_DB === 'true' || process.env.IS_TEST === 'true') {
    // dont publish for localhost test runs
    return;
  }

  await eventPubSub
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
