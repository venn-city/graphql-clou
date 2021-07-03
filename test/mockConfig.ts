export default function mockConfig() {
  jest.mock('@venncity/nested-config', () => {
    const actual = jest.requireActual('@venncity/nested-config')(__dirname);
    const dataModelPath = './../../test/datamodel.graphql';
    const sdlPath = './../../test/openCRUD.graphql';
    const dataModelKey = 'graphql.schema.datamodel.path';
    const sdlKey = 'graphql.schema.datamodel.path';
    return () => ({
      has: (key: string) => {
        if (key === dataModelKey) {
          return true;
        }
        if (key === sdlKey) {
          return true;
        }

        return actual.has;
      },
      get: (key: string) => {
        if (key === dataModelKey) {
          return dataModelPath;
        }
        if (key === sdlKey) {
          return sdlPath;
        }

        return actual.get;
      }
    });
  });
}

