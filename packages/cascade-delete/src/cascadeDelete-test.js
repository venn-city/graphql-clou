const { hacker } = require('faker');
const sinon = require('sinon');
const { openCrudDataModel } = require('@venncity/opencrud-schema-provider');
const { sq } = require('@venncity/sequelize-model');
const { sequelizeDataProvider } = require('@venncity/sequelize-data-provider');
const { cascadeDelete } = require('./cascadeDelete');
const models = require('./../../../test/model');

sq.init(models);

describe('cascade delete', () => {
  let context;

  let government;
  let ministry1;
  let ministry2;
  const updateGovernmentStub = sinon.stub();
  const deleteManyMinistriesStub = sinon.stub();
  updateGovernmentStub.resolves();
  deleteManyMinistriesStub.resolves();

  beforeEach(async () => {
    context = {
      openCrudDataModel,
      DAOs: {
        governmentDAO: {
          updateGovernment: updateGovernmentStub
        },
        ministryDAO: {
          deleteManyMinistries: deleteManyMinistriesStub,
          getHooks: () => {
            return {
              preDelete: () => {}
            };
          }
        }
      }
    };
    const governmentName = hacker.phrase();
    const ministryName1 = hacker.phrase();
    const ministryName2 = hacker.phrase();

    government = await sequelizeDataProvider.createEntity('Government', { name: governmentName });
    ministry1 = await sequelizeDataProvider.createEntity('Ministry', {
      name: ministryName1,
      government: {
        connect: {
          id: government.id
        }
      }
    });
    ministry2 = await sequelizeDataProvider.createEntity('Ministry', {
      name: ministryName2,
      government: {
        connect: {
          id: government.id
        }
      }
    });
  });

  test('should delete', async () => {
    await cascadeDelete({ entityName: 'Government', entityId: government.id, context });

    expect(updateGovernmentStub.firstCall.args[1]).toMatchObject({
      data: { ministries: { disconnect: { id: ministry1.id } } },
      where: { id: government.id }
    });
    expect(updateGovernmentStub.secondCall.args[1]).toMatchObject({
      data: { ministries: { disconnect: { id: ministry2.id } } },
      where: { id: government.id }
    });
    expect(deleteManyMinistriesStub.firstCall.args[1]).toMatchObject({ id_in: [ministry1.id, ministry2.id] });
  });

  // TODO: cover all cascade options
});
