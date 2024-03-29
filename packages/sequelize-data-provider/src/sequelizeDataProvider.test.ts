/* eslint-disable no-unused-vars,@typescript-eslint/no-unused-vars */
import { hacker, random } from 'faker';
import { omit } from 'lodash';
import sequelizeModel from '@venncity/sequelize-model';
import sequelizeDataProvider from './sequelizeDataProvider';
import { loadSingleRelatedEntities, loadRelatedEntities } from './batchDataProvider';
import models from '../../demo/basic/sequelize/model';

sequelizeModel.sq.init(models);

describe('sequelizeDataProvider', () => {
  /**

   +------------+                                 +--------------+
   |Government1 +-------------------------+       |Government2   |
   | Atlantis   +-------+                 |       | Sorcha       |
   | 9500BC     |       |                 |       | 1964         |
   +-----+------+       |                 |       +--------------+
         |              |                 |
         |              |                 |
   +-----+----+   +-----+----+     +------+-----+
   |Ministry1 |   |Ministry2 |     |Ministry3   |
   | Finance  |   | Defence  |     | Healthcare |
   | 87       |   | 22.1     |     | 22.1       |
   +----------+   +----------+     +------------+
         |             |
         |             |
         |             |
   +-----+----+   +----------+                     +-------------+
   |Minister1 |   |Minister2 +-----------+         |Minister3    |
   | Lazaros  |   | Natassas |           |         | Vasileia    |
   +----------+   +----------+   +-------+-----+   +-------------+
       |               |         |Vote3        |
       |               |         | Raise taxes |  +--------------+
       |               |         | Nay         |  |Vote4         |
   +---+--------+      |         +-------------+  | Make war     |
   |Vote1       |      |                          | Abstain      |
   | Build walls|  +---+--------+                 +--------------+
   | Yea        |  |Vote2       |
   +------------+  | Build walls|
                   | Nay        |
                   +------------+
   */

  const randomNumber = random.number();

  let government1;
  const governmentName1 = `9500BC${randomNumber}`;
  const governmentCountry1 = `Atlantis${randomNumber}`;
  let government2;
  const governmentName2 = `1966${randomNumber}`;
  const governmentCountry2 = `Sorcha${randomNumber}`;

  let ministry1;
  const ministryName1 = `Finance${randomNumber}`;
  const ministryBudget1 = 87 + randomNumber;
  const ministryDomains1 = ['Finance'];
  let ministry2;
  const ministryName2 = `Defence${randomNumber}`;
  const ministryBudget2 = 22.1 + randomNumber;
  const ministryDomains2 = ['Defence'];
  let ministry3;
  const ministryName3 = `Healthcare${randomNumber}`;
  const ministryBudget3 = 22.1 + randomNumber;
  const ministryDomains3 = ['Healthcare', 'Longevity'];

  let minister1;
  const ministerName1 = `Lazaros${randomNumber}`;
  let minister2;
  const ministerName2 = `Natassas${randomNumber}`;

  // @ts-ignore
  let minister3;
  const ministerName3 = `Vasileia${randomNumber}`;

  // @ts-ignore
  let vote1;
  const voteName1 = `Build walls${randomNumber}`;
  const voteBallot1 = 'YEA';
  // @ts-ignore
  let vote2;
  const voteName2 = `Build walls${randomNumber}`;
  const voteBallot2 = 'NAY';
  // @ts-ignore
  let vote3;
  const voteName3 = `Raise taxes${randomNumber}`;
  const voteBallot3 = 'NAY';
  let vote4;
  const voteName4 = `Make war${randomNumber}`;
  const voteBallot4 = 'ABSTAIN';

  beforeAll(async () => {
    console.info('random seed', randomNumber);
    government1 = await sequelizeDataProvider.createEntity('Government', { name: governmentName1, country: governmentCountry1 });
    government2 = await sequelizeDataProvider.createEntity('Government', { name: governmentName2, country: governmentCountry2 });
    minister1 = await sequelizeDataProvider.createEntity('Minister', {
      name: ministerName1
    });
    minister2 = await sequelizeDataProvider.createEntity('Minister', {
      name: ministerName2
    });
    minister3 = await sequelizeDataProvider.createEntity('Minister', {
      name: ministerName3
    });
    ministry1 = await sequelizeDataProvider.createEntity('Ministry', {
      name: ministryName1,
      budget: ministryBudget1,
      government: {
        connect: {
          id: government1.id
        }
      },
      minister: {
        connect: {
          id: minister1.id
        }
      },
      domains: ministryDomains1
    });
    ministry2 = await sequelizeDataProvider.createEntity('Ministry', {
      name: ministryName2,
      budget: ministryBudget2,
      government: {
        connect: {
          id: government1.id
        }
      },
      minister: {
        connect: {
          id: minister2.id
        }
      },
      domains: ministryDomains2
    });
    ministry3 = await sequelizeDataProvider.createEntity('Ministry', {
      name: ministryName3,
      budget: ministryBudget3,
      government: {
        connect: {
          id: government1.id
        }
      },
      domains: ministryDomains3
    });

    vote1 = await sequelizeDataProvider.createEntity('Vote', {
      name: voteName1,
      ballot: voteBallot1,
      minister: {
        connect: {
          id: minister1.id
        }
      }
    });
    vote2 = await sequelizeDataProvider.createEntity('Vote', {
      name: voteName2,
      ballot: voteBallot2,
      minister: {
        connect: {
          id: minister2.id
        }
      }
    });
    vote3 = await sequelizeDataProvider.createEntity('Vote', {
      name: voteName3,
      ballot: voteBallot3,
      minister: {
        connect: {
          id: minister2.id
        }
      }
    });
    vote4 = await sequelizeDataProvider.createEntity('Vote', {
      name: voteName4,
      ballot: voteBallot4,
      lawInfo: { a: 'b' },
      lawInfoJson: { x: 'y' }
    });
  });

  afterAll(async () => {
    sequelizeModel.sq.sequelize.close();
  });

  test('getEntity', async () => {
    const fetchedGovernment = await sequelizeDataProvider.getEntity('Government', { name: governmentName1 });
    expect(fetchedGovernment).toMatchObject(government1);
  });

  describe('getAllEntities', () => {
    test('getAllEntities simple', async () => {
      const fetchedGovernments = await sequelizeDataProvider.getAllEntities('Government', { where: { name: governmentName1 } });
      expect(fetchedGovernments).toHaveLength(1);
      expect(fetchedGovernments[0]).toMatchObject(government1);
    });

    describe('Complex nested filters', () => {
      test('1xn_every => 1x1 => nxm_some', async () => {
        const fetchedGovernments = await sequelizeDataProvider.getAllEntities('Government', {
          where: { ministries_every: { minister: { votes_some: { name: voteName1 } } }, name_ends_with: `${randomNumber}` },
          first: 5
        });
        expect(fetchedGovernments).toHaveLength(1);
        expect(fetchedGovernments[0]).toMatchObject(government2);
      });

      test('1xn_none => 1x1 => nxm_some', async () => {
        const fetchedGovernments = await sequelizeDataProvider.getAllEntities('Government', {
          where: { ministries_none: { minister: { votes_some: { name: voteName1 } } }, name: governmentName2 },
          first: 5
        });
        expect(fetchedGovernments).toHaveLength(1);
        expect(fetchedGovernments[0]).toMatchObject(government2);
      });

      test('nxm_none => nxm_some', async () => {
        const fetchedGovernments = await sequelizeDataProvider.getAllEntities('Government', {
          where: {
            lobbyists_none: {
              governments_some: {
                name: governmentName1
              }
            },
            name: governmentName1
          },
          first: 5
        });
        expect(fetchedGovernments).toHaveLength(1);
        expect(fetchedGovernments[0]).toMatchObject(government1);
      });

      test('nxm_every => nxm_some', async () => {
        const fetchedGovernments = await sequelizeDataProvider.getAllEntities('Government', {
          where: {
            lobbyists_every: {
              governments_some: {
                name: governmentName1
              }
            },
            name: governmentName1
          },
          first: 5
        });
        expect(fetchedGovernments).toHaveLength(1);
        expect(fetchedGovernments[0]).toMatchObject(government1);
      });
    });

    describe('1x1', () => {
      test('getAllEntities with nested filter for 1x1 relation', async () => {
        const fetchedMinistries = await sequelizeDataProvider.getAllEntities('Ministry', {
          where: { minister: { name: ministerName1 } },
          first: 5
        });
        expect(fetchedMinistries).toHaveLength(1);
        expect(fetchedMinistries[0]).toMatchObject(ministry1);
      });

      test('getAllEntities with nested filter for 1x1 null (non-existing) relation', async () => {
        const fetchedMinistries = await sequelizeDataProvider.getAllEntities('Ministry', {
          where: { minister: null, name: ministryName3 },
          first: 5
        });
        expect(fetchedMinistries).toHaveLength(1);
        expect(fetchedMinistries[0]).toMatchObject(ministry3);
      });
    });

    describe('1xn', () => {
      test('getAllEntities with nested _every filter for 1xn relation, _every condition complies', async () => {
        const fetchedGovernments = await sequelizeDataProvider.getAllEntities('Government', {
          where: { ministries_every: { name_ends_with: `e${randomNumber}` }, name: governmentName1 },
          first: 5
        });
        expect(fetchedGovernments).toHaveLength(1);
        expect(fetchedGovernments[0]).toMatchObject(government1);
      });

      test('getAllEntities with nested _every filter for 1xn relation, and another level of nesting', async () => {
        const fetchedGovernments = await sequelizeDataProvider.getAllEntities('Government', {
          where: { ministries_every: { name_ends_with: `e${randomNumber}`, minister: { name_ends_with: `${randomNumber}` } }, name: governmentName1 },
          first: 5
        });
        expect(fetchedGovernments).toHaveLength(1);
        expect(fetchedGovernments[0]).toMatchObject(government1);
      });

      test('getAllEntities with nested _every filter for 1xn relation, _every condition not complies', async () => {
        const fetchedGovernments = await sequelizeDataProvider.getAllEntities('Government', {
          where: { ministries_none: { name_ends_with: `re${randomNumber}` }, name: governmentName1 },
          first: 5
        });
        expect(fetchedGovernments).toHaveLength(0);
      });

      test('getAllEntities with nested _every filter for 1xn relation, _every condition complies emptily', async () => {
        const fetchedGovernments = await sequelizeDataProvider.getAllEntities('Government', {
          where: { ministries_none: { name_ends_with: `e${randomNumber}` }, name: governmentName2 },
          first: 5
        });
        expect(fetchedGovernments).toHaveLength(1);
        expect(fetchedGovernments[0]).toMatchObject(government2);
      });

      test('getAllEntities with nested _none filter for 1xn relation, _none condition complies', async () => {
        const fetchedGovernments = await sequelizeDataProvider.getAllEntities('Government', {
          where: { ministries_every: { name_ends_with: `e${randomNumber}` }, name: governmentName1 },
          first: 5
        });
        expect(fetchedGovernments).toHaveLength(1);
        expect(fetchedGovernments[0]).toMatchObject(government1);
      });

      test('getAllEntities with nested _none filter for 1xn relation, _none condition not complies', async () => {
        const fetchedGovernments = await sequelizeDataProvider.getAllEntities('Government', {
          where: { ministries_every: { name_ends_with: `ce${randomNumber}` }, name: governmentName1 },
          first: 5
        });
        expect(fetchedGovernments).toHaveLength(0);
      });

      test('getAllEntities with nested _none filter for 1xn relation, _none condition complies emptily', async () => {
        const fetchedGovernments = await sequelizeDataProvider.getAllEntities('Government', {
          where: { ministries_none: { name_ends_with: `e${randomNumber}` }, name: governmentName2 },
          first: 5
        });
        expect(fetchedGovernments).toHaveLength(1);
        expect(fetchedGovernments[0]).toMatchObject(government2);
      });

      test('getAllEntities with nested _some filter for 1xn relation, _some condition complies', async () => {
        const fetchedGovernments = await sequelizeDataProvider.getAllEntities('Government', {
          where: { ministries_some: { name_ends_with: `re${randomNumber}` }, name: governmentName1 },
          first: 5
        });
        expect(fetchedGovernments).toHaveLength(1);
        expect(fetchedGovernments[0]).toMatchObject(government1);
      });

      test('getAllEntities with nested _some filter for 1xn relation, _some condition not complies', async () => {
        const fetchedGovernments = await sequelizeDataProvider.getAllEntities('Government', {
          where: { ministries_some: { name_ends_with: `XX${randomNumber}` }, name: governmentName1 },
          first: 5
        });
        expect(fetchedGovernments).toHaveLength(0);
      });

      test('getAllEntities with nested _some filter for 1xn relation, _some condition not complies emptily', async () => {
        const fetchedGovernments = await sequelizeDataProvider.getAllEntities('Government', {
          where: { ministries_some: { name_ends_with: `e${randomNumber}` }, name: governmentName2 },
          first: 5
        });
        expect(fetchedGovernments).toHaveLength(0);
      });

      test('getAllEntities with nested _some filter for 1xn relation, inside 1x1', async () => {
        const fetchedMinistries = await sequelizeDataProvider.getAllEntities('Ministry', {
          where: { government: { ministries_some: { name_ends_with: `re${randomNumber}` }, name: governmentName1 } },
          first: 5
        });
        expect(fetchedMinistries).toHaveLength(3);
      });
      test('getAllEntities with nested _none filter for 1xn relation, inside 1x1', async () => {
        const fetchedMinistries = await sequelizeDataProvider.getAllEntities('Ministry', {
          where: { government: { ministries_none: { name_ends_with: `re${randomNumber}` }, name: governmentName1 } },
          first: 5
        });
        expect(fetchedMinistries).toHaveLength(0);
      });
      test('getAllEntities with orderBy arg', async () => {
        const fetchedMinistriesDESC = await sequelizeDataProvider.getAllEntities('Ministry', {
          where: { government: { ministries_some: { name_ends_with: `re${randomNumber}` }, name: governmentName1 } },
          orderBy: 'id_DESC'
        });
        expect(fetchedMinistriesDESC).toHaveLength(3);

        // default order is id_ASC
        const fetchedMinistriesDefaultOrderBy = await sequelizeDataProvider.getAllEntities('Ministry', {
          where: { government: { ministries_some: { name_ends_with: `re${randomNumber}` }, name: governmentName1 } }
        });
        expect(fetchedMinistriesDefaultOrderBy).toHaveLength(3);

        expect(fetchedMinistriesDESC.reverse()).toEqual(fetchedMinistriesDefaultOrderBy);
      });
    });

    describe('nxm', () => {
      test('getAllEntities with nested _every filter for nxm relation, _every condition complies', async () => {
        const fetchedMinisters = await sequelizeDataProvider.getAllEntities('Minister', {
          where: { votes_every: { ballot: 'NAY' }, id: minister2.id },
          first: 5
        });
        expect(fetchedMinisters).toHaveLength(1);
        expect(fetchedMinisters[0]).toMatchObject(minister2);
      });

      // TODO: Fails without first filtering!
      test('getAllEntities with nested _every filter for nxm and 1x1 relations', async () => {
        const fetchedMinisters = await sequelizeDataProvider.getAllEntities('Minister', {
          where: { votes_every: { ballot: 'NAY' }, id: minister2.id, ministry: { name: ministryName2 } },
          first: 5
        });
        expect(fetchedMinisters).toHaveLength(1);
        expect(fetchedMinisters[0]).toMatchObject(minister2);
      });

      test('getAllEntities with nested _every filter for nxm relation, _every condition not complies', async () => {
        const fetchedMinisters = await sequelizeDataProvider.getAllEntities('Minister', {
          where: { votes_every: { name: `Build walls${randomNumber}` }, id: minister2.id },
          first: 5
        });
        expect(fetchedMinisters).toHaveLength(0);
      });

      test('getAllEntities with nested _every filter for nxm relation, _every condition complies emptily', async () => {
        const fetchedMinisters = await sequelizeDataProvider.getAllEntities('Minister', {
          where: { votes_every: { ballot: 'NAY' }, id: minister3.id },
          first: 5
        });
        expect(fetchedMinisters).toHaveLength(1);
        expect(fetchedMinisters[0]).toMatchObject(minister3);
      });

      test('getAllEntities with nested _none filter for nxm relation, _none condition complies', async () => {
        const fetchedMinisters = await sequelizeDataProvider.getAllEntities('Minister', {
          where: { votes_none: { name: 'Fix roads' }, id: minister2.id },
          first: 5
        });
        expect(fetchedMinisters).toHaveLength(1);
        expect(fetchedMinisters[0]).toMatchObject(minister2);
      });

      test('getAllEntities with nested _none filter for nxm relation, _none condition not complies', async () => {
        const fetchedMinisters = await sequelizeDataProvider.getAllEntities('Minister', {
          where: { votes_none: { ballot: 'NAY' }, id: minister2.id },
          first: 5
        });
        expect(fetchedMinisters).toHaveLength(0);
      });

      test('getAllEntities with nested _none filter for nxm relation, _none condition complies emptily', async () => {
        const fetchedMinisters = await sequelizeDataProvider.getAllEntities('Minister', {
          where: { votes_none: { ballot: 'NAY' }, id: minister3.id },
          first: 5
        });
        expect(fetchedMinisters).toHaveLength(1);
        expect(fetchedMinisters[0]).toMatchObject(minister3);
      });

      test('getAllEntities with nested _some filter for nxm relation, _some condition complies', async () => {
        const fetchedMinisters = await sequelizeDataProvider.getAllEntities('Minister', {
          where: { votes_some: { name: `Build walls${randomNumber}` }, id: minister2.id },
          first: 5
        });
        expect(fetchedMinisters).toHaveLength(1);
        expect(fetchedMinisters[0]).toMatchObject(minister2);
      });

      test('getAllEntities with nested _some filter for nxm relation, _some condition not complies', async () => {
        const fetchedMinisters = await sequelizeDataProvider.getAllEntities('Minister', {
          where: { votes_some: { ballot: 'ABSTAIN' }, id: minister2.id },
          first: 5
        });
        expect(fetchedMinisters).toHaveLength(0);
      });

      test('getAllEntities with nested _some filter for nxm relation, _some condition not complies emptily', async () => {
        const fetchedMinisters = await sequelizeDataProvider.getAllEntities('Minister', {
          where: { votes_some: { ballot: 'NAY' }, id: minister3.id },
          first: 5
        });
        expect(fetchedMinisters).toHaveLength(0);
      });

      test('getAllEntities with nested _some filter for nxm relation, _some condition not complies emptily', async () => {
        const fetchedMinisters = await sequelizeDataProvider.getAllEntities('Minister', {
          where: { votes_some: { ballot: 'NAY' }, id: minister3.id },
          first: 5
        });
        expect(fetchedMinisters).toHaveLength(0);
      });

      test('getAllEntities for nxm null (non-existing) relation', async () => {
        const fetchedVotes = await sequelizeDataProvider.getAllEntities('Vote', {
          where: { minister: null, name_ends_with: `${randomNumber}` },
          first: 5
        });
        expect(fetchedVotes).toHaveLength(1);
        expect(fetchedVotes[0]).toMatchObject(vote4);
      });
    });

    describe('Array field filters', () => {
      test('contains_every', async () => {
        const fetchedMinistries = await sequelizeDataProvider.getAllEntities('Ministry', {
          where: {
            name: ministryName3,
            domains_contains_every: ['Healthcare', 'Longevity']
          }
        });
        expect(fetchedMinistries).toHaveLength(1);
        expect(fetchedMinistries[0]).toMatchObject(ministry3);
      });

      test('contains_every (negative)', async () => {
        const fetchedMinistries = await sequelizeDataProvider.getAllEntities('Ministry', {
          where: {
            name: ministryName3,
            domains_contains_every: ['Healthcare', 'Sport']
          }
        });
        expect(fetchedMinistries).toHaveLength(0);
      });

      test('contains_some', async () => {
        const fetchedMinistries = await sequelizeDataProvider.getAllEntities('Ministry', {
          where: {
            name: ministryName3,
            domains_contains_some: ['Healthcare', 'Sport']
          }
        });
        expect(fetchedMinistries).toHaveLength(1);
        expect(fetchedMinistries[0]).toMatchObject(ministry3);
      });
    });
  });

  test('getEntitiesConnection', async () => {
    const fetchedGovernmentConnection = await sequelizeDataProvider.getEntitiesConnection('Government', { where: { name: governmentName1 } });
    expect(fetchedGovernmentConnection).toHaveProperty('aggregate', { __typename: 'AggregateGovernment', count: 1 });
  });

  test('getRelatedEntity', async () => {
    const fetchedGovernment = await sequelizeDataProvider.getRelatedEntity('Ministry', ministry1.id, 'government');
    expect(fetchedGovernment).toMatchObject(government1);
  });

  test('getRelatedEntityId', async () => {
    const fetchedGovernmentId = await sequelizeDataProvider.getRelatedEntityId('Ministry', ministry1.id, 'government');
    expect(fetchedGovernmentId).toEqual(government1.id);
  });

  test('getRelatedEntities', async () => {
    const fetchedMinistries = await sequelizeDataProvider.getRelatedEntities('Government', government1.id, 'ministries');
    expect(fetchedMinistries.sort().map(m => omit(m, 'ministerId'))).toEqual(
      [ministry1, ministry2, ministry3].sort().map(m => omit(m, 'ministerId'))
    );
  });

  describe('getRelatedEntityIds', () => {
    test('getRelatedEntityIds no args', async () => {
      const fetchedMinistryIds = await sequelizeDataProvider.getRelatedEntityIds('Government', government1.id, 'ministries');
      expect(fetchedMinistryIds.sort()).toEqual([ministry1.id, ministry2.id, ministry3.id].sort());
    });

    test('getRelatedEntityIds with args', async () => {
      const fetchedMinistryIds = await sequelizeDataProvider.getRelatedEntityIds('Government', government1.id, 'ministries', {
        first: 1,
        orderBy: 'createdAt_ASC'
      });
      expect(fetchedMinistryIds).toHaveLength(1);
      expect(fetchedMinistryIds[0]).toEqual(ministry1.id);
    });

    test('getRelatedEntityIds with args for nXm relation', async () => {
      const fetchedVoteIds = await sequelizeDataProvider.getRelatedEntityIds('Minister', minister2.id, 'votes', {
        first: 1,
        orderBy: 'createdAt_ASC'
      });
      expect(fetchedVoteIds).toHaveLength(1);
    });
  });

  describe('batchDataProvider', () => {
    describe('loadSingleRelatedEntities', () => {
      test('loadSingleRelatedEntities one key', async () => {
        const fetchedGovernments = await loadSingleRelatedEntities('Ministry', [
          { originalEntityId: ministry1.id, relationEntityName: 'government' }
        ]);
        const fetchedGovernmentIds = fetchedGovernments.map(g => g.id);
        expect(fetchedGovernmentIds).toEqual([government1.id]);
      });

      test('loadSingleRelatedEntities one missing key', async () => {
        const fetchedGovernments = await loadSingleRelatedEntities('Ministry', [
          { originalEntityId: 'ishouldntexist999', relationEntityName: 'government' }
        ]);
        expect(fetchedGovernments).toEqual([undefined]);
      });

      test('loadSingleRelatedEntities multiple keys', async () => {
        const [relatedGovernment1, relatedMinister1, relatedGovernment2, relatedMinister3, relatedGovernment3] = await loadSingleRelatedEntities(
          'Ministry',
          [
            { originalEntityId: ministry1.id, relationEntityName: 'government' },
            { originalEntityId: ministry1.id, relationEntityName: 'minister' },
            { originalEntityId: ministry2.id, relationEntityName: 'government' },
            { originalEntityId: ministry3.id, relationEntityName: 'minister' },
            { originalEntityId: ministry3.id, relationEntityName: 'government' }
          ]
        );
        expect(relatedGovernment1.id).toEqual(government1.id);
        expect(relatedMinister1.id).toEqual(minister1.id);
        expect(relatedGovernment2.id).toEqual(government1.id);
        expect(relatedMinister3).toEqual(null);
        expect(relatedGovernment3.id).toEqual(government1.id);
      });

      test('loadSingleRelatedEntities one duplicate key', async () => {
        const [relatedGovernment1, relatedGovernment2] = await loadSingleRelatedEntities('Ministry', [
          { originalEntityId: ministry1.id, relationEntityName: 'government' },
          { originalEntityId: ministry1.id, relationEntityName: 'government' }
        ]);
        expect(relatedGovernment1.id).toEqual(government1.id);
        expect(relatedGovernment2.id).toEqual(government1.id);
      });
    });

    describe('loadRelatedEntities', () => {
      test('loadRelatedEntities one key', async () => {
        const [fetchedMinistries] = await loadRelatedEntities('Government', [{ originalEntityId: government1.id, relationEntityName: 'ministries' }]);
        const fetchedMinistryIds = fetchedMinistries.map(g => g.id);
        expect(fetchedMinistryIds.sort()).toEqual([ministry1.id, ministry2.id, ministry3.id].sort());
      });

      test('loadRelatedEntities one missing key', async () => {
        const [fetchedMinistries] = await loadRelatedEntities('Government', [
          { originalEntityId: 'ishouldntexist999', relationEntityName: 'ministries' }
        ]);
        expect(fetchedMinistries).toBeFalsy();
      });

      test('loadRelatedEntities multiple keys', async () => {
        const [relatedMinistries1, relatedLobbyists1, relatedMinistries2] = await loadRelatedEntities('Government', [
          { originalEntityId: government1.id, relationEntityName: 'ministries' },
          { originalEntityId: government1.id, relationEntityName: 'lobbyists' },
          { originalEntityId: government2.id, relationEntityName: 'ministries' }
        ]);
        expect(relatedMinistries1.map(g => g.id).sort()).toEqual([ministry1.id, ministry2.id, ministry3.id].sort());
        expect(relatedLobbyists1).toEqual([]);
        expect(relatedMinistries2).toEqual([]);
      });

      test('loadRelatedEntities multiple keys with and without args', async () => {
        const [relatedMinistries1, relatedLobbyists1, relatedMinistries2] = await loadRelatedEntities('Government', [
          { originalEntityId: government1.id, relationEntityName: 'ministries', args: { where: { name: ministry2.name } } },
          { originalEntityId: government1.id, relationEntityName: 'lobbyists' },
          { originalEntityId: government2.id, relationEntityName: 'ministries' }
        ]);
        expect(relatedMinistries1.map(g => g.id).sort()).toEqual([ministry2.id].sort());
        expect(relatedLobbyists1).toEqual([]);
        expect(relatedMinistries2).toEqual([]);
      });

      test('loadRelatedEntities multiple keys with matching args', async () => {
        const [relatedMinistries1, relatedLobbyists1, relatedMinistries2, relatedMinistries3, relatedMinistries4] = await loadRelatedEntities(
          'Government',
          [
            { originalEntityId: government1.id, relationEntityName: 'ministries', args: { where: { name: ministry2.name } } },
            { originalEntityId: government1.id, relationEntityName: 'lobbyists' },
            { originalEntityId: government2.id, relationEntityName: 'ministries', args: { where: { name: ministry2.name } } },
            { originalEntityId: government2.id, relationEntityName: 'ministries', args: { where: { name_not: 'wrong-name' } } },
            { originalEntityId: government1.id, relationEntityName: 'ministries', args: { where: { name_not: 'wrong-name' } } }
          ]
        );
        expect(relatedMinistries1.map(g => g.id).sort()).toEqual([ministry2.id].sort());
        expect(relatedLobbyists1).toEqual([]);
        expect(relatedMinistries2).toEqual([]);
        expect(relatedMinistries3).toEqual([]);
        expect(relatedMinistries4.map(g => g.id).sort()).toEqual([ministry1.id, ministry2.id, ministry3.id].sort());
      });

      test('loadRelatedEntities multiple keys with different args', async () => {
        const lobbyist1 = await sequelizeDataProvider.createEntity('Lobbyist', {
          name: `lobbyist1${randomNumber}`,
          governments: {
            connect: [
              {
                id: government1.id
              }
            ]
          }
        });
        const [relatedMinistries1a, relatedMinistries1b, relatedLobbyists1, relatedMinistries2] = await loadRelatedEntities('Government', [
          { originalEntityId: government1.id, relationEntityName: 'ministries', args: { where: { name: ministry2.name } } },
          { originalEntityId: government1.id, relationEntityName: 'ministries', args: { where: { name_not: ministry1.name } } },
          { originalEntityId: government1.id, relationEntityName: 'lobbyists' },
          { originalEntityId: government1.id, relationEntityName: 'ministries' }
        ]);
        expect(relatedMinistries1a.map(g => g.id).sort()).toEqual([ministry2.id].sort());
        expect(relatedMinistries1b.map(g => g.id).sort()).toEqual([ministry2.id, ministry3.id].sort());
        expect(relatedLobbyists1.map(g => g.id)).toEqual([lobbyist1.id]);
        expect(relatedMinistries2.map(g => g.id).sort()).toEqual([ministry1.id, ministry2.id, ministry3.id].sort());
        await sequelizeDataProvider.updateEntity(
          'Lobbyist',
          {
            governments: {
              disconnect: [
                {
                  id: government1.id
                }
              ]
            }
          },
          {
            id: lobbyist1.id
          }
        );
        await sequelizeDataProvider.deleteEntity('Lobbyist', { id: lobbyist1.id });
      });
    });
  });

  describe('Create many entities', () => {
    test('simple', async () => {
      const government1Name = hacker.phrase();
      const government2Name = hacker.phrase();

      const createdGovernments = await sequelizeDataProvider.createManyEntities('Government', [
        {
          name: government1Name
        },
        {
          name: government2Name
        }
      ]);

      expect(createdGovernments).toHaveLength(2);
      expect(createdGovernments[0]).toHaveProperty('name', government1Name);
      expect(createdGovernments[1]).toHaveProperty('name', government2Name);
    });
    test('with nested connect', async () => {
      const government1Name = hacker.phrase();
      const government2Name = hacker.phrase();
      const ministry1Name = hacker.phrase();
      const ministry2Name = hacker.phrase();
      const ministry3Name = hacker.phrase();
      const ministry4Name = hacker.phrase();
      const nestedMinistry1 = await sequelizeDataProvider.createEntity('Ministry', { name: ministry1Name });
      const nestedMinistry2 = await sequelizeDataProvider.createEntity('Ministry', { name: ministry2Name });
      const nestedMinistry3 = await sequelizeDataProvider.createEntity('Ministry', { name: ministry3Name });
      const nestedMinistry4 = await sequelizeDataProvider.createEntity('Ministry', { name: ministry4Name });

      const createdGovernments = await sequelizeDataProvider.createManyEntities('Government', [
        {
          name: government1Name,
          ministries: {
            connect: [{ id: nestedMinistry1.id }, { id: nestedMinistry2.id }]
          }
        },
        {
          name: government2Name,
          ministries: {
            connect: [{ id: nestedMinistry3.id }, { id: nestedMinistry4.id }]
          }
        }
      ]);

      expect(createdGovernments).toHaveLength(2);
      expect(createdGovernments[0]).toHaveProperty('name', government1Name);
      expect(createdGovernments[1]).toHaveProperty('name', government2Name);

      const government1Ministries = await sequelizeDataProvider.getRelatedEntities('Government', createdGovernments[0].id, 'ministries');
      expect(government1Ministries).toHaveLength(2);
      const government1MinistryNames = government1Ministries.map(ministry => ministry.name);
      expect(government1MinistryNames).toContain(ministry1Name);
      expect(government1MinistryNames).toContain(ministry2Name);

      const government2Ministries = await sequelizeDataProvider.getRelatedEntities('Government', createdGovernments[1].id, 'ministries');
      expect(government2Ministries).toHaveLength(2);
      const government2MinistryNames = government2Ministries.map(ministry => ministry.name);
      expect(government2MinistryNames).toContain(ministry3Name);
      expect(government2MinistryNames).toContain(ministry4Name);
    });
    test('with nested create - should throw error until supported', async () => {
      const government1Name = hacker.phrase();
      const government2Name = hacker.phrase();
      const ministry1Name = hacker.phrase();
      const ministry2Name = hacker.phrase();
      const ministry3Name = hacker.phrase();
      const ministry4Name = hacker.phrase();

      await expect(
        sequelizeDataProvider.createManyEntities('Government', [
          {
            name: government1Name,
            ministries: {
              create: [{ name: ministry1Name }, { name: ministry2Name }]
            }
          },
          {
            name: government2Name,
            ministries: {
              create: [{ name: ministry3Name }, { name: ministry4Name }]
            }
          }
        ])
      ).rejects.toThrowError('Nested create of entities inside of createMany is not currently supported');
    });
  });

  test('createEntity', async () => {
    const createdGovernmentName = hacker.phrase();
    const createdGovernment = await sequelizeDataProvider.createEntity('Government', { name: createdGovernmentName });
    expect(createdGovernment).toMatchObject({
      name: createdGovernmentName,
      createdAt: createdGovernment.createdAt,
      updatedAt: createdGovernment.updatedAt,
      deletedAt: null,
      deleted: 0
    });
  });

  test('createEntity should fail if join parameter is not valid', async () => {
    const createdMinistryName = hacker.phrase();
    await expect(sequelizeDataProvider.createEntity('Ministry', { name: createdMinistryName, government: { connect: {} } })).rejects.toThrowError(
      'Invalid argument in government parameter'
    );
  });

  describe('Update entity', () => {
    test('updateEntity', async () => {
      const createdGovernmentName = hacker.phrase();
      const updatedGovernmentName = hacker.phrase();
      const createdGovernment = await sequelizeDataProvider.createEntity('Government', { name: createdGovernmentName });
      const updatedGovernment = await sequelizeDataProvider.updateEntity(
        'Government',
        {
          name: updatedGovernmentName
        },
        {
          name: createdGovernmentName
        }
      );
      expect(updatedGovernment).toMatchObject({
        name: updatedGovernmentName,
        createdAt: createdGovernment.createdAt,
        updatedAt: updatedGovernment.updatedAt,
        deletedAt: null,
        deleted: 0
      });
    });

    test('updateEntity should fail if join parameter is not valid', async () => {
      const createdMinistryName = hacker.phrase();
      const ministryBudget = 10 + randomNumber;

      const createdMinistry = await sequelizeDataProvider.createEntity('Ministry', { name: createdMinistryName, budget: ministryBudget });

      await expect(sequelizeDataProvider.updateEntity('Ministry', { government: { connect: {} } }, { id: createdMinistry.id })).rejects.toThrowError(
        'Invalid argument in government parameter'
      );
    });

    test('updateEntity which does not exist', async () => {
      const updatedGovernment = await sequelizeDataProvider.updateEntity(
        'Government',
        {
          name: hacker.phrase()
        },
        {
          id: hacker.phrase()
        }
      );
      expect(updatedGovernment).toBeNull();
    });

    test('updateEntity with connect and disconnect', async () => {
      const createdGovernmentName = hacker.phrase();
      const updatedGovernmentName = hacker.phrase();
      const anotherGovernment = await sequelizeDataProvider.createEntity('Government', { name: createdGovernmentName });
      const nestedMinistry = await sequelizeDataProvider.createEntity('Ministry', { name: hacker.phrase() });
      const nestedMinistry2 = await sequelizeDataProvider.createEntity('Ministry', { name: hacker.phrase() });

      // Update with connect.
      const updatedGovernmentWithMinistries = await sequelizeDataProvider.updateEntity(
        'Government',
        {
          name: updatedGovernmentName,
          ministries: {
            connect: [{ id: nestedMinistry.id }, { id: nestedMinistry2.id }]
          }
        },
        {
          name: createdGovernmentName
        }
      );
      const ministryIds = await sequelizeDataProvider.getRelatedEntityIds('Government', anotherGovernment.id, 'ministries');
      expect(ministryIds.sort()).toEqual([nestedMinistry.id, nestedMinistry2.id].sort());
      expect(updatedGovernmentWithMinistries).toMatchObject({
        name: updatedGovernmentName,
        createdAt: updatedGovernmentWithMinistries.createdAt,
        updatedAt: updatedGovernmentWithMinistries.updatedAt,
        deletedAt: null,
        deleted: 0
      });

      // Update with disconnect.
      await sequelizeDataProvider.updateEntity(
        'Government',
        {
          name: updatedGovernmentName,
          ministries: {
            disconnect: [{ id: nestedMinistry.id }, { id: nestedMinistry2.id }]
          }
        },
        {
          name: updatedGovernmentName
        }
      );
      const ministryIdsAfterDisconnect = await sequelizeDataProvider.getRelatedEntityIds('Government', anotherGovernment.id, 'ministries');
      expect(ministryIdsAfterDisconnect).toHaveLength(0);
    });
  });

  test('deleteEntity', async () => {
    const createdGovernmentName = hacker.phrase();
    await sequelizeDataProvider.createEntity('Government', { name: createdGovernmentName });
    await sequelizeDataProvider.deleteEntity('Government', { name: createdGovernmentName });
    const deletedGovernment = await sequelizeDataProvider.getEntity('Government', {
      name: createdGovernmentName
    });
    expect(deletedGovernment).toBeFalsy();
  });

  test('updateManyEntities', async () => {
    const createdGovernmentName1 = hacker.phrase();
    const createdGovernmentName2 = hacker.phrase();
    const updatedGovernmentName = hacker.phrase();
    await sequelizeDataProvider.createEntity('Government', { name: createdGovernmentName1 });
    await sequelizeDataProvider.createEntity('Government', { name: createdGovernmentName2 });
    const updatedGovernments: any = await sequelizeDataProvider.updateManyEntities(
      'Government',
      {
        name: updatedGovernmentName
      },
      {
        name_in: [createdGovernmentName1, createdGovernmentName2]
      }
    );
    updatedGovernments.forEach(updatedGovernment => {
      expect(updatedGovernment).toMatchObject({
        name: updatedGovernmentName,
        createdAt: updatedGovernment.createdAt,
        updatedAt: updatedGovernment.updatedAt,
        deletedAt: null,
        deleted: 0
      });
    });
  });

  test('deleteManyEntities', async () => {
    const createdGovernmentName1 = hacker.phrase();
    const createdGovernmentName2 = hacker.phrase();
    await sequelizeDataProvider.createEntity('Government', { name: createdGovernmentName1 });
    await sequelizeDataProvider.createEntity('Government', { name: createdGovernmentName2 });
    await sequelizeDataProvider.deleteManyEntities('Government', {
      name_in: [createdGovernmentName1, createdGovernmentName2]
    });
    const deletedGovernments = await sequelizeDataProvider.getAllEntities('Government', {
      where: {
        name_in: [createdGovernmentName1, createdGovernmentName2]
      }
    });
    expect(deletedGovernments).toHaveLength(0);
  });
});
