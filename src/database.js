const { Sequelize } = require("sequelize");

const sequelize = new Sequelize({
  dialect: "postgres",
  database: "vk",
  user: "rodion",
  password: "rodion",
  host: "localhost",
  port: 5432,
  ssl: true,
  clientMinMessages: "notice",
});

module.exports = sequelize;
