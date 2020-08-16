import { hacker } from 'faker';
import sinon from 'sinon';
import { openCrudDataModel } from '@venncity/opencrud-schema-provider';
import { sq } from '@venncity/sequelize-model';
import { sequelizeDataProvider } from '@venncity/sequelize-data-provider';
import { cascadeDelete } from './cascadeDelete';
import models from '../../../test/model';
import mockConfig from '../../../test/mockConfig';

mockConfig();

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

  afterAll(() => jest.resetAllMocks());

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
