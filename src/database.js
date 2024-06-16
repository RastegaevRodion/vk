const { Sequelize } = require("sequelize");

const sequelize = new Sequelize({
  dialect: "postgres",
  database: "vk",
  user: "anastasia",
  password: "anastasia",
  host: "localhost",
  port: 5432,
  ssl: true,
  clientMinMessages: "notice",
});

module.exports = sequelize;
