const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const user = require("./src/user/user.routes");

const app = express();
app.use(cors({ origin: "*" }));

app.use(express.json());
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));

app.use("/user", user);

app.listen(3001, function () {
  console.log("Are you Ready???!");
});
