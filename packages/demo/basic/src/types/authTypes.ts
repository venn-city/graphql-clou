// TODO: clean-up types.
type SupportedActions = {
  CREATE: string;
  READ: string;
  UPDATE: string;
  DELETE: string;
  ACCESS: string;
  BOOK: string;
  IMPERSONATE: string;
  CANCEL: string;
  APPLY: string;
  READ_OTHERS: string;
  PAY_WITH_SAP: string;
  SEND: string;
  REQUEST_CANCELATION: string;
  VOTE: string;
};
type HasPermissionFunc = (auth, action, authDataFromDB, context, authTypeName) => boolean | any;
type VerifyCanUpdateFunc = ({
  where,
  auth,
  data,
  context,
  hooks,
  authTypeName,
  dataProvider,
  entityName
}: {
  where: any;
  auth: any;
  data: any;
  context: any;
  hooks: any;
  authTypeName: any;
  dataProvider: any;
  entityName: any;
}) => Promise<any[]>;
type VerifyHasPermissionAndFilterUnauthorizedFieldsFunc = (context, auth, fetchedEntity, hooks, authTypeName) => Promise<any>;
type FilterUnauthorizedFieldsFunc = (ability: any, entity: any, action: any) => { $type: any };
type VerifyHasPermissionFunc = (auth, action, authDataFromDB, context, authTypeName) => void;

export type DaoAuth = {
  buildAuth: (context, hooks) => Promise<any>;
  supportedActions: SupportedActions;
  hasPermission: HasPermissionFunc;
  verifyCanUpdate: VerifyCanUpdateFunc;
  verifyHasPermissionAndFilterUnauthorizedFields: VerifyHasPermissionAndFilterUnauthorizedFieldsFunc;
  filterUnauthorizedFields: FilterUnauthorizedFieldsFunc;
  verifyHasPermission: VerifyHasPermissionFunc;
};

export const mockDaoAuth: DaoAuth = {
  buildAuth(context, hooks): Promise<any> {
    return Promise.resolve({});
  },
  filterUnauthorizedFields(ability: any, entity: any, action: any): { $type: any } {
    return { $type: entity.$type, ...entity };
  },
  hasPermission(auth, action, authDataFromDB, context, authTypeName): any {
    return true;
  },
  supportedActions: {
    CREATE: 'create',
    READ: 'read',
    UPDATE: 'update',
    DELETE: 'delete',
    ACCESS: 'access',
    BOOK: 'book',
    IMPERSONATE: 'impersonate',
    CANCEL: 'cancel',
    APPLY: 'apply',
    READ_OTHERS: 'readOthers',
    PAY_WITH_SAP: 'payWithSap',
    SEND: 'send',
    REQUEST_CANCELATION: 'requestCancelation',
    VOTE: 'vote'
  },
  verifyCanUpdate({
    where,
    auth,
    data,
    context,
    hooks,
    authTypeName,
    dataProvider,
    entityName
  }: {
    where: any;
    auth: any;
    data: any;
    context: any;
    hooks: any;
    authTypeName: any;
    dataProvider: any;
    entityName: any;
  }): Promise<any[]> {
    return dataProvider.getAllEntities(entityName, {
      where
    });
  },
  verifyHasPermission(auth, action, authDataFromDB, context, authTypeName): void {},
  verifyHasPermissionAndFilterUnauthorizedFields(context, auth, fetchedEntity, hooks, authTypeName): Promise<any> {
    return Promise.resolve(fetchedEntity);
  }
};
