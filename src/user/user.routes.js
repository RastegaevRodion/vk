const express = require("express");
const bcrypt = require("bcrypt");
const saltRounds = 10;
const User = require("./user.model");

const router = express.Router();

router.post("/signIn", async (req, res) => {
  const user = await User.findOne({ where: { email: req.body.email } });
  if (!user) {
    res.json({ error: "Email or password are invalid" });
  }
  const match = await bcrypt.compare(req.body.password, user.password);
  if (match) {
    const { password, ...rest } = user.dataValues;
    res.json({ user: { ...rest } });
  } else {
    res.json({ error: "Email or password are invalid" });
  }
});

router.post("/signUp", async (req, res) => {
  try {
    bcrypt.genSalt(saltRounds, (err, salt) => {
      bcrypt.hash(req.body.password, salt, (err, hash) => {
        User.create({
          firstName: req.body.firstName,
          lastName: req.body.lastName,
          email: req.body.email,
          password: hash,
        });
        res.json({ success: true });
      });
    });
  } catch (err) {
    res.json({ success: false });
  }
});

module.exports = router;
