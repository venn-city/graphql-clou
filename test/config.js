const dotenv = require("dotenv");
initDotEnv(dotenv);

function initDotEnv() {
  const { error } = dotenv.config({ path: `${process.cwd()}/.env` });
  if (error) {
    console.warn("Did you create a '.env' file?");
    throw new Error(error);
  }
}

module.exports = {
  test: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: "localhost",
    port: process.env.DB_PORT,
    dialect: "postgres",
    schema: "venn"
  }
};
