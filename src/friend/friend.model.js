const { Sequelize, Model, DataTypes } = require("sequelize");
const sequelize = require("../database.js");
const User = require("../user/user.model.js");

const Friend = sequelize.define("friends", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  who: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  whom: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  isFriend: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
  },
});

(async () => {
  await sequelize.sync({ alter: true });
})();

module.exports = Friend;
