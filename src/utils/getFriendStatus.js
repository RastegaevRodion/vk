const Friend = require("../friend/friend.model");
const { Op } = require("sequelize");

const getFriendStatus = async (user, me) => {
    if (me === user.id) {
        return 'me';
    }
    const friend = await Friend.findOne({ where: { [Op.or]: [
        { who: me, whom: user.id },
        { who: user.id, whom: me }
    ] } });
    if (!friend) {
        return 'none';
    }
    if (friend.dataValues.isFriend) {
        return 'friend';
    }
    if (friend.dataValues.who === me) {
        return 'request';
    }
    return 'offer';
  };
  
  module.exports = getFriendStatus;
  