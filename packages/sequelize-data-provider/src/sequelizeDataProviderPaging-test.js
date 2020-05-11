/* eslint-disable no-unused-vars */
const { random } = require('faker');
const sequelizeModel = require('@venncity/sequelize-model');
const sequelizeDataProvider = require('./sequelizeDataProvider');
const models = require('./../../../test/model');

sequelizeModel.sq.init(models);

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
  // Sometimes both testsuits generate the same random number and test data collide
  // Adding 123 makes sure data is not intersecting between testsuites
  const randomNumber = random.number() + 123;

  let government1;
  const governmentName1 = `9500BC${randomNumber}`;
  const governmentCountry1 = `Atlantis${randomNumber}`;
  let government2;
  const governmentName2 = `1966${randomNumber}`;
  const governmentCountry2 = `Sorcha${randomNumber}`;

  let ministry1;
  const ministryName1 = `Finance${randomNumber}`;
  const ministryBudget1 = 87 + randomNumber;
  let ministry2;
  const ministryName2 = `Defence${randomNumber}`;
  const ministryBudget2 = 22.1 + randomNumber;
  let ministry3;
  const ministryName3 = `Healthcare${randomNumber}`;
  const ministryBudget3 = 22.1 + randomNumber;

  let minister1;
  const ministerName1 = `Lazaros${randomNumber}`;
  let minister2;
  const ministerName2 = `Natassas${randomNumber}`;
  let minister3;
  const ministerName3 = `Vasileia${randomNumber}`;

  let vote1;
  const voteName1 = `Build walls${randomNumber}`;
  const voteBallot1 = 'YEA';
  let vote2;
  const voteName2 = `Build walls${randomNumber}`;
  const voteBallot2 = 'NAY';
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
    sequelizeModel.sq.sequelize.close();
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
  });
});
