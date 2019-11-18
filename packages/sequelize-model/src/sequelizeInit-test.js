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
});
