export function extractSingleResult(originalEntity, relationFieldName: string) {
  return (
    originalEntity &&
    originalEntity[relationFieldName] &&
    (Array.isArray(originalEntity[relationFieldName]) && originalEntity[relationFieldName].length === 1
      ? originalEntity[relationFieldName][0].dataValues // [0] is required in cases of many-to-one mappings using a join-table.
      : originalEntity[relationFieldName].dataValues)
  );
}

export function extractMultipleResults(originalEntity, relationFieldName: string) {
  return extractManyResult(originalEntity && originalEntity[relationFieldName]);
}

export function extractManyResult(relatedEntities) {
  if (Array.isArray(relatedEntities)) {
    return relatedEntities.map(relatedEntity => relatedEntity.dataValues);
  }
  return relatedEntities ? relatedEntities.dataValues : [];
}
