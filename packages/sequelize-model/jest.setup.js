process.env.IS_TEST = true;
// eslint-disable-next-line import/no-extraneous-dependencies
require('dotenv').config({ path: `${process.cwd()}/../../.env` });

jest.setTimeout(30000);
