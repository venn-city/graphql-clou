const { transformComputedFieldsWhereArguments } = require('./computedFieldsWhereTransformation');

describe('computedFieldsWhereTransformation', () => {
  test('transformComputedFieldsWhereArguments should transform simple computed fields where clause', () => {
    const originalWhere = {
      extendedFieldFoo: 'bar'
    };
    const computedWhereArgumentsTransformation = {
      extendedFieldFoo: extendedFieldFoo => {
        return { name_not: extendedFieldFoo };
      }
    };
    const context = {
      DAOs: {
        ministryDAO: {
          computedWhereArgumentsTransformation: {}
        }
      }
    };
    const transformedWhere = transformComputedFieldsWhereArguments({
      originalWhere,
      whereInputName: 'GovernmentWhereInput',
      computedWhereArgumentsTransformation,
      context
    });
    expect(transformedWhere).toEqual({
      name_not: 'bar'
    });
  });

  test('transformComputedFieldsWhereArguments should transform computed fields where clause with related entities', () => {
    const originalWhere = {
      extendedFieldFoo: 'bar',
      ministries_some: {
        extendedFieldMoo: 'baz'
      }
    };
    const computedWhereArgumentsTransformation = {
      extendedFieldFoo: extendedFieldFoo => {
        return { name_not: extendedFieldFoo };
      }
    };
    const context = {
      DAOs: {
        ministryDAO: {
          computedWhereArgumentsTransformation: {
            extendedFieldMoo: extendedFieldMoo => {
              return { name_starts_with: extendedFieldMoo };
            }
          }
        }
      }
    };
    const transformedWhere = transformComputedFieldsWhereArguments({
      originalWhere,
      whereInputName: 'GovernmentWhereInput',
      computedWhereArgumentsTransformation,
      context
    });
    expect(transformedWhere).toEqual({
      name_not: 'bar',
      ministries_some: {
        name_starts_with: 'baz'
      }
    });
  });
});
