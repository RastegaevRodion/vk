const express = require("express");
const { Op } = require("sequelize");
const Friend = require("./friend.model");
const User = require("../user/user.model");
const getId = require("../utils/getId");
const getUser = require("../utils/getUser");

const router = express.Router();

router.post("/", async (req, res) => {
  if (!req.body.whom) {
    return res.status(400).json({ success: false });
  }
  const userId = getId(req, res);
  const offer = await Friend.findOne({
    where: {
      who: req.body.whom,
      whom: userId,
      isFriend: false,
    },
  });
  if (offer) {
    await Friend.update(
      { ...offer.dataValues, isFriend: true },
      { where: { id: offer.dataValues.id } }
    );
    return res.status(200).json({ isFriend: true });
  } else {
    const request = await Friend.findOne({
      where: {
        who: userId,
        whom: req.body.whom,
      },
    });
    if (!request) {
      await Friend.create({
        who: userId,
        whom: req.body.whom,
        isFriend: false,
      });
      return res.status(200).json({ isFriend: false });
    }
  }
  return res.status(200).json({ success: request.dataValues.isFriend });
});

router.delete("/:id", async (req, res) => {
  const userId = getId(req, res);
  await Friend.destroy({
    where: {
      [Op.or]: [
        { who: userId, whom: req.params.id },
        { who: req.params.id, whom: userId },
      ],
    },
  });
  return res.status(200).json({ success: true });
});

router.get("/requests", async (req, res) => {
  const userId = getId(req, res);
  const requests = await Friend.findAll({
    where: { who: userId, isFriend: false },
  });
  const users = await User.findAll({
    where: { id: { [Op.in]: requests.map((e) => e.whom) } },
  });
  const data = await Promise.all(users.map(({ dataValues }) => getUser({ ...dataValues, friendStatus: 'request' })));
  return res.status(200).json({ data });
});

router.get("/offers", async (req, res) => {
  const userId = getId(req, res);
  const offers = await Friend.findAll({
    where: { whom: userId, isFriend: false },
  });
  const users = await User.findAll({
    where: { id: { [Op.in]: offers.map((e) => e.who) } },
  });
  const data = await Promise.all(users.map(({ dataValues }) => getUser({ ...dataValues, friendStatus: 'offer' })));
  return res.status(200).json({ data });
});

router.get("/", async (req, res) => {
  const userId = getId(req, res);
  const friends = await Friend.findAll({
    where: { isFriend: true, [Op.or]: [{ who: userId }, { whom: userId }] },
  });
  if (!friends) {
    res.status(404).json({ data: null });
  }
  const ids = friends.map(({ dataValues }) => {
    const { who, whom } = dataValues;
    return who === userId ? whom : who;
  });
  const users = await User.findAll({ where: { id: { [Op.in]: ids } } });
  const data = await Promise.all(users.map(({ dataValues }) => getUser({ ...dataValues, friendStatus: 'friend' })));
  return res.status(200).json({ data });
});

module.exports = router;
