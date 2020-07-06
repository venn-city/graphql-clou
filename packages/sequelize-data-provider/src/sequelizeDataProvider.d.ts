declare function getEntity(entityName: string, where: any): Promise<any>;
declare function getAllEntities(entityName: string, args?: any): Promise<any[]>;
declare function getRelatedEntityId(entityName: string, originalEntityId: string, relationEntityName: string): Promise<any>;
declare function getRelatedEntity(entityName: string, originalEntityId: string, relationFieldName: string): Promise<any>;
declare function getRelatedEntityIds(entityName: string, originalEntityId: string, relationEntityName: string, args?: any): Promise<any>;
declare function getRelatedEntities(entityName: string, originalEntityId: string, relationFieldName: string, args?: any): Promise<any>;
declare function createEntity(entityName: string, entityToCreate: any): Promise<any>;
declare function createManyEntities(entityName: string, entitiesToCreate: any): Promise<any>;
declare function updateEntity(entityName: string, data: any, where: any): Promise<any>;
declare function updateManyEntities(entityName: string, data: any, where: any): Promise<any[]>;
declare function deleteEntity(entityName: string, where: any): Promise<any>;
declare function deleteManyEntities(entityName: string, where: any): Promise<any[]>;
declare function getEntitiesConnection(entityName: string, args: any): Promise<{
    aggregate: {
        count: any;
        __typename: string;
    };
    __typename: string;
    pageInfo: {
        startCursor: null;
    };
}>;
declare const _default: {
    getEntity: typeof getEntity;
    getAllEntities: typeof getAllEntities;
    getRelatedEntityId: typeof getRelatedEntityId;
    getRelatedEntity: typeof getRelatedEntity;
    getRelatedEntityIds: typeof getRelatedEntityIds;
    getRelatedEntities: typeof getRelatedEntities;
    createEntity: typeof createEntity;
    createManyEntities: typeof createManyEntities;
    updateEntity: typeof updateEntity;
    updateManyEntities: typeof updateManyEntities;
    deleteEntity: typeof deleteEntity;
    deleteManyEntities: typeof deleteManyEntities;
    getEntitiesConnection: typeof getEntitiesConnection;
};
export default _default;
