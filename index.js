const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const user = require("./src/user/user.routes");

const app = express();
app.use(
  cors({
    credentials: true,
    origin: "http://localhost:3000",
    allowedHeaders: ["Content-Type", "Authorization"],
    exposedHeaders: ["SET-COOKIE"],
  })
);

app.use(cookieParser());
app.use(express.json({ limit: "50mb" }));
app.use(bodyParser.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true }));

app.use("/static", express.static("public"));

app.use("/user", user);

app.listen(3001, function () {
  console.log("Are you Ready???!");
});
