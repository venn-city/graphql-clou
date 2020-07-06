process.env.CLS_ENABLED = 'true';
process.env.IS_TEST = 'false';
import { hacker, random } from 'faker';
import models from '../../../test/model';
import sq from './sequelizeInit';

sq.init(models);

const DUMMY_MODEL_FUNCTION = () => ({ associate: () => {} });
const sequelize = sq.sequelize;

describe('sequelizeInit', () => {
  afterAll(async () => {
    await sq.sequelize.close();
  });

  test('should only init the sequelize models once', () => {
    expect(sq.initialized).toBeTruthy();

    sq.init({
      DummyModel: DUMMY_MODEL_FUNCTION
    });
    expect(sq).not.toHaveProperty('DummyModel');
  });

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
    const createdMinistries = await sq.Ministry.bulkCreate([
      { name: hacker.phrase(), budget: 100 },
      { name: hacker.phrase(), budget: 200 }
    ]);
    createdMinistries.forEach(ministry => expect(ministry).toHaveProperty('id'));
    const createdMinistriesBudgets = createdMinistries.map(ministry => ministry.budget);
    expect(createdMinistriesBudgets).toContain(100);
    expect(createdMinistriesBudgets).toContain(200);

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
    expect(updatedEntity.dataValues).toHaveProperty('deleted', 0);
  });

  test('sequelize should not format a float of null', async () => {
    const createdMinistry = await sq.Ministry.create({ name: hacker.phrase(), budget: null });
    expect(createdMinistry.dataValues).toHaveProperty('budget', null);
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

  test('sequelize should support block transactions using cls namespace without using transaction explicitly', async () => {
    const originalBudget = 80;
    const createdMinistry = await sq.Ministry.create({ name: hacker.phrase(), budget: originalBudget });

    let errorMessage;

    try {
      await sequelize.transaction(async () => {
        const newBudget = 88.2;
        const fetchedMinistry = await sq.Ministry.findOne({
          where: {
            id: createdMinistry.id
          }
        });
        await fetchedMinistry.update({ budget: newBudget });
        const ministryDuringTransaction = await sq.Ministry.findOne({ where: { id: createdMinistry.id } });

        expect(ministryDuringTransaction.dataValues).toHaveProperty('budget', newBudget);

        throw new Error('Some error that occurred during a transaction');
      });
    } catch (e) {
      errorMessage = e.message;
    }

    expect(errorMessage).toEqual('Some error that occurred during a transaction');

    const ministryAfterTransaction = await sq.Ministry.findOne({ where: { id: createdMinistry.id } });
    expect(ministryAfterTransaction.dataValues).toHaveProperty('budget', originalBudget);
  });
});
