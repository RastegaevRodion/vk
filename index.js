const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const { createServer } = require('node:http');
const cookieParser = require("cookie-parser");
const user = require("./src/user/user.routes");
const friend = require("./src/friend/friend.routes");
const User = require("./src/user/user.model");
const { Server } = require("socket.io");
const {
  getUserSocket,
  FRIEND_ADD_SOCKET,
  FRIEND_DELETE_SOCKET
} = require("./src/utils/getSocketNames");

const corsConfig = {
  credentials: true,
   origin: "http://localhost:3000",
   allowedHeaders: ["Content-Type", "Authorization"],
   exposedHeaders: ["SET-COOKIE"],
};

const app = express();
app.use(cors(corsConfig));

app.use(cookieParser());
app.use(express.json({ limit: "50mb" }));
app.use(bodyParser.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true }));

app.use("/static", express.static("public"));

app.use("/user", user);
app.use("/friend", friend);

const httpServer = createServer(app);

const io = new Server(httpServer, { cors: corsConfig });

io.on("connection", (socket) => {
  userId = socket.handshake.auth.id;

  socket.join(getUserSocket(userId));

  User.update({ isOnline: true }, { where: { id: userId } });

  socket.on(FRIEND_ADD_SOCKET, (to) => {
    socket.to(getUserSocket(to)).emit(FRIEND_ADD_SOCKET, userId);
  });

  socket.on(FRIEND_DELETE_SOCKET, (to) => {
    socket.to(getUserSocket(to)).emit(FRIEND_DELETE_SOCKET, userId);
  });

  socket.on('disconnect', () => {
    socket.leave(getUserSocket(userId));
    User.update({ isOnline: false, lastOnline: new Date().toISOString() }, { where: { id: userId } });
  });
});

httpServer.listen(3001, function () {
  console.log("Are you Ready???!");
});
