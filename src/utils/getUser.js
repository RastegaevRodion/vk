const getFriendStatus = require("./getFriendStatus");

const getUser = async (user, me) => {
  const { password, ...rest } = user;
  if (!me) {
    return rest;
  }
  const friendStatus = await getFriendStatus(rest, me);
  return { ...rest, friendStatus };
};

module.exports = getUser;
