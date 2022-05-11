import { getOpenCrudIntrospection, openCrudDataModel, openCrudSchema, openCrudSchemaGraphql } from './openCRUDSchemaProvider';

jest.mock('@venncity/nested-config', () => {
  const dataModelPath = './../demo/basic/src/graphql/datamodel.graphql';
  const sdlPath = './../demo/basic/src/graphql/openCRUD.graphql';
  const dataModelKey = 'graphql.schema.datamodel.path';
  return () => ({
    has: () => true,
    get: (key: string) => {
      if (key === dataModelKey) {
        return dataModelPath;
      }

      return sdlPath;
    }
  });
});

describe('mock datamodels', () => {
  afterAll(() => jest.restoreAllMocks());

  test('openCrudDataModel mocked', () => {
    expect(openCrudDataModel).toMatchSnapshot();
  });

  test('openCrudSchema mocked', () => {
    expect(openCrudSchema).toMatchSnapshot();
  });

  test('openCrudSchemaGraphql mocked', () => {
    expect(openCrudSchemaGraphql).toMatchSnapshot();
  });

  test('getOpenCrudIntrospection mocked', () => {
    expect(getOpenCrudIntrospection()).toMatchSnapshot();
  });
});
