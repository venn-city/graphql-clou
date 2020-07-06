/* eslint-disable no-unused-vars */
import { random } from 'faker';
import { uniq } from 'lodash';
import { sq } from '@venncity/sequelize-model';
import sequelizeDataProvider from './sequelizeDataProvider';
import models from '../../../test/model';

sq.init(models);

describe('sequelizeDataProvider paging tests', () => {
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
      |                |         |Vote3        |
      |                |         | Raise taxes |  +--------------+
      |                |         | Nay         |  |Vote4         |
   +---+--------+      |         +-------------+  | Make war     |
   |Vote1       |      |                          | Abstain      |
   | Build walls|  +---+--------+                 +--------------+
   | Yea        |  |Vote2       |
   +------------+  | Build walls|
                   | Nay        |
                   +------------+
   */

  // Sometimes both testsuits generate the same random number and test data collide
  // Adding 123 makes sure data is not intersecting between testsuites
  const randomNumber = random.number() + 123;
  // @ts-ignore
  let government1;
  const governmentName1 = `9500BC${randomNumber}`;
  const governmentCountry1 = `Atlantis${randomNumber}`;
  // @ts-ignore
  let government2;
  const governmentName2 = `1966${randomNumber}`;
  const governmentCountry2 = `Sorcha${randomNumber}`;

  // @ts-ignore
  let ministry1;
  const ministryName1 = `Finance${randomNumber}`;
  const ministryBudget1 = 87 + randomNumber;
  // @ts-ignore
  let ministry2;
  const ministryName2 = `Defence${randomNumber}`;
  const ministryBudget2 = 22.1 + randomNumber;
  // @ts-ignore
  let ministry3;
  const ministryName3 = `Healthcare${randomNumber}`;
  const ministryBudget3 = 22.1 + randomNumber;

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

  // @ts-ignore
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
      }
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
      }
    });
    ministry3 = await sequelizeDataProvider.createEntity('Ministry', {
      name: ministryName3,
      budget: ministryBudget3,
      government: {
        connect: {
          id: government1.id
        }
      }
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
      ballot: voteBallot4
    });
  });

  afterAll(async () => {
    sq.sequelize.close();
  });

  test('getAllEntities with nested _every and _none filters', async () => {
    for (let i = 0; i < 5; i += 1) {
      // eslint-disable-next-line no-await-in-loop
      const createdGovernment = (await sequelizeDataProvider.createEntity('Government', {
        name: `${governmentName1}${i}`
      })) as any;

      const ministries: any = [];
      for (let j = 0; j < 3; j += 1) {
        // eslint-disable-next-line no-await-in-loop
        const createdMinistry = await sequelizeDataProvider.createEntity('Ministry', {
          name: `${ministryName3}${j}`,
          government: {
            connect: {
              id: createdGovernment.id
            }
          }
        });
        ministries.push(createdMinistry);
      }
    }

    const fetchedGovernments = await sequelizeDataProvider.getAllEntities('Government', {
      where: {
        AND: [
          {
            ministries_every: { name_starts_with: ministryName3 }
          },
          {
            lobbyists_none: {
              governments_some: {
                name_starts_with: 'f567oo'
              }
            }
          },
          {
            name_starts_with: governmentName1
          }
        ]
      },
      first: 4,
      skip: 1,
      orderBy: 'createdAt_ASC'
    });
    expect(uniq(fetchedGovernments.map(g => g.id))).toHaveLength(4);
  });

  test('getAllEntities with nested _some filter for 1xn relation, with limit', async () => {
    for (let i = 0; i < 20; i += 1) {
      // eslint-disable-next-line no-await-in-loop
      await sequelizeDataProvider.createEntity('Ministry', {
        name: `${ministryName1}${i}`,
        government: {
          connect: {
            id: government1.id
          }
        }
      });
    }

    const fetchedGovernments = await sequelizeDataProvider.getAllEntities('Government', {
      where: {
        OR: [
          {
            ministries_some: { name_starts_with: `Finance${randomNumber}` }
          },
          {
            name: governmentName2
          }
        ]
      },
      first: 10,
      orderBy: 'createdAt_ASC'
    });
    expect(fetchedGovernments).toHaveLength(2);

    const fetchedMinistries = await sequelizeDataProvider.getAllEntities('Ministry', {
      where: {
        government: {
          lobbyists_none: {
            governments_some: {
              name: governmentName1
            }
          }
        }
      },
      first: 10,
      skip: 3,
      orderBy: 'createdAt_ASC'
    });
    expect(fetchedMinistries).toHaveLength(10);
  });

  test('getAllEntities with nested _some filter for nxm relation, with limit', async () => {
    async function createVotesForMinister(ministerId) {
      for (let i = 0; i < 5; i += 1) {
        // eslint-disable-next-line no-await-in-loop
        await sequelizeDataProvider.createEntity('Vote', {
          name: `${voteName1}${i}`,
          ballot: voteBallot1,
          minister: {
            connect: {
              id: ministerId
            }
          }
        });
      }
    }

    await createVotesForMinister(minister1.id);
    await createVotesForMinister(minister2.id);

    const fetchedMinisters = await sequelizeDataProvider.getAllEntities('Minister', {
      where: {
        AND: [
          {
            votes_some: { ballot: voteBallot1 }
          },
          {
            name_in: [ministerName1, ministerName2]
          }
        ]
      },
      first: 2,
      orderBy: 'createdAt_ASC'
    });
    expect(fetchedMinisters).toHaveLength(2);
  });
});
