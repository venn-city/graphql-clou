const { hacker, random } = require('faker');
const sq = require('./sequelizeInit');

describe('sequelizeInit', () => {
  test('sequelize should be initialized properly with models for all test schema entities', async () => {
    const governments = await sq.Government.findAll({ where: { id: 'x' } });
    expect(governments).toHaveLength(0);

    const missingGovernment = await sq.Government.findOne({ where: { id: 'x' } });
    expect(missingGovernment).toBeNull();

    const ministers = await sq.Minister.findAll({ where: { id: 'x' } });
    expect(ministers).toHaveLength(0);

    const ministries = await sq.Ministry.findAll({ where: { id: 'x' } });
    expect(ministries).toHaveLength(0);

    const votes = await sq.Vote.findAll({ where: { id: 'x' } });
    expect(votes).toHaveLength(0);
  });

  test('sequelize should call schema hooks', async () => {
    const createdMinistry = await sq.Ministry.create({ name: hacker.phrase(), budget: 77.9 });
    const fetchedMinistry = await sq.Ministry.findOne({
      where: {
        id: createdMinistry.id
      }
    });
    const updatedEntity = await fetchedMinistry.update({
      budget: 88.2
    });
    expect(updatedEntity.dataValues).toHaveProperty('budget', 88.2);
  });

  test('sequelize should call schema hooks on related fields (nesting)', async () => {
    const num1 = random.number();
    const num2 = random.number();
    const ministerName = hacker.phrase();
    const vote1 = await sq.Vote.create({ name: `vote${num1}` });
    const vote2 = await sq.Vote.create({ name: `vote${num2}` });
    const createdMinister = await sq.Minister.create({ name: ministerName, budget: 1313 });

    await createdMinister.addVotes([vote1.id, vote2.id]);
    const fetchedMinister = await sq.Minister.findOne({
      where: { id: createdMinister.id },
      include: {
        model: sq.Vote,
        as: 'votes',
        attributes: ['createdAt', 'updatedAt']
      }
    });

    expect(fetchedMinister.dataValues.votes).toHaveLength(2);
    const ministerVotes = fetchedMinister.dataValues.votes;

    ministerVotes.forEach(v => {
      expect(typeof v.dataValues.createdAt === 'string').toBeTruthy();
      expect(typeof v.dataValues.updatedAt === 'string').toBeTruthy();
    });
  });
});
