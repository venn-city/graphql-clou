const {
  errors: { ForbiddenError }
} = require('@venncity/errors');
// eslint-disable-next-line import/no-extraneous-dependencies
const { initAuth, hasPermissionForAllFields, supportedActions, filterUnauthorizedFields } = require('@venncity/auth');

const { READ, UPDATE } = supportedActions;

async function buildAuth(context, hooks) {
  const authContext = await hooks.authFunctions.buildAuthContext(context);
  const auth = await initAuth(
    {
      userDetails: context.auth,
      isService: context.auth.isService,
      isPublicAccess: context.auth.isPublicAccess
    },
    authContext
  );
  return auth;
}

function verifyHasPermission(auth, action, authDataFromDB, context, authTypeName) {
  if (!hasPermission(auth, action, authDataFromDB, context, authTypeName)) {
    const userId = (context.auth && context.auth.id) || 'anonymous';
    const errorString = `User ${userId} is not authorized to perform ${action} on ${authTypeName}. Auth data from DB: `;
    console.error(errorString, authDataFromDB);
    throw new ForbiddenError({ message: 'Not Authorized' });
  }
}

function hasPermission(auth, action, authDataFromDB, context, authTypeName) {
  if (context.skipAuth) {
    return true;
  }
  return auth.can(action, {
    $type: authTypeName,
    ...authDataFromDB
  });
}

async function verifyCanUpdate({ where, auth, data, context, hooks, authTypeName, dataProvider, entityName }) {
  const entitiesToUpdate = await dataProvider.getAllEntities(entityName, { where });

  // eslint-disable-next-line no-restricted-syntax
  for (const fetchedEntity of entitiesToUpdate) {
    // eslint-disable-next-line no-await-in-loop
    const authDataFromDB = await hooks.authFunctions.getAuthDataFromDB(context, fetchedEntity.id);
    // Row level.
    verifyHasPermission(auth, UPDATE, authDataFromDB, context, authTypeName);

    // Column level.
    if (!hasPermissionForAllFields(auth, { $type: authTypeName, ...data }, UPDATE)) {
      const userId = (context.auth && context.auth.id) || 'anonymous';
      const error = `User with id ${userId} tried to update an ${authTypeName} with fields he is not authorized to update.`;
      console.warn(error, 'fields to update: ', data);
      throw new ForbiddenError({ message: 'Not Authorized' });
    }
  }
  return entitiesToUpdate;
}

async function verifyHasPermissionAndFilterUnauthorizedFields(context, auth, fetchedEntity, hooks, authTypeName) {
  if (!fetchedEntity) {
    return fetchedEntity;
  }
  const authDataFromDB = await hooks.authFunctions.getAuthDataFromDB(context, fetchedEntity && fetchedEntity.id);
  verifyHasPermission(auth, READ, authDataFromDB, context, authTypeName);
  return context.skipAuth ? fetchedEntity : fetchedEntity && filterUnauthorizedFields(auth, { $type: authTypeName, ...fetchedEntity }, READ);
}

module.exports = {
  buildAuth,
  verifyHasPermission,
  hasPermission,
  verifyCanUpdate,
  verifyHasPermissionAndFilterUnauthorizedFields,
  supportedActions,
  filterUnauthorizedFields
};
