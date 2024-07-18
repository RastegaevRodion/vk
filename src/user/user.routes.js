const express = require("express");
const { Op } = require("sequelize");
const path = require("path");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const User = require("./user.model");
const { tokenSecret } = require("../constants");
const getId = require("../utils/getId");
const getUser = require("../utils/getUser");

const router = express.Router();

const saltRounds = 10;

const diskStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public");
  },
  filename: (req, file, cb) => {
    cb(
      null,
      `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`
    );
  },
});

const upload = multer({
  storage: diskStorage,
  limits: {
    fileSize: 1024 * 1024 * 25, // Max file size 25MB
  },
});

router.post("/signIn", async (req, res) => {
  try {
    if (!req.body.email || !req.body.password) {
      return res.status(400).json({ success: false });
    }
    const user = await User.findOne({ where: { email: req.body.email } });
    if (!user) {
      return res.status(400).json({ error: "Email or password are invalid" });
    }
    const match = await bcrypt.compare(
      req.body.password,
      user.dataValues.password
    );
    if (match) {
      const token = jwt.sign({ userId: user.dataValues.id }, tokenSecret, {
        expiresIn: "30d",
      });
      res.cookie("jwt", token, {
        maxAge: new Date(new Date() + 1000 * 60 * 60 * 24 * 30),
        httpOnly: true,
      });
      return res.status(200).json({ data: getUser(user.dataValues) });
    } else {
      return res.status(400).json({ error: "Email or password are invalid" });
    }
  } catch (err) {
    return res.status(500).json({ success: false });
  }
});

router.post("/signUp", async (req, res) => {
  try {
    bcrypt.hash(req.body.password, saltRounds, (err, hash) => {
      User.create({
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        password: hash,
      });
      return res.status(200).json({ success: true });
    });
  } catch (err) {
    return res.status(500).json({ success: false });
  }
});

router.get("/logout", async (req, res) => {
  try {
    res.clearCookie("jwt", {
      httpOnly: true,
      domain: "localhost",
    });
    return res.status(200).json({ success: true });
  } catch (err) {
    return res.status(500).json({ success: false });
  }
});

const images = upload.fields([
  { name: "avatar", maxCount: 1 },
  { name: "background", maxCount: 1 },
]);

router.put("/", images, async (req, res) => {
  const userId = getId(req, res);
  const { id, password, ...rest } = req.body;
  const user = { ...rest };
  if (req.files?.avatar) {
    const [image] = req.files.avatar;
    const avatar = `http://localhost:3001/static/${image.filename}`;
    user.avatar = avatar;
  }

  if (req.files?.background) {
    const [image] = req.files.background;
    const background = `http://localhost:3001/static/${image.filename}`;
    user.background = background;
  }

  await User.update(user, { where: { id: userId } });
  const { dataValues } = await User.findOne({ where: { id: userId } });
  res.status(200).json({ data: getUser(dataValues) });
});

router.get("/search", async (req, res) => {
  const { key } = req.query;
  if (!key) {
    return res.status(404).json({ error: "not_found" });
  }
  const words = key.split(/\s+/);
  console.log([
    ...words.map((word) => {
      return { firstName: { [Op.iLike]: word } };
    }),
    ...words.map((word) => {
      return { lastName: { [Op.iLike]: word } };
    }),
  ]);
  const users = await User.findAll({
    where: {
      [Op.or]: [
        ...words.map((word) => {
          return { firstName: { [Op.iLike]: word } };
        }),
        ...words.map((word) => {
          return { lastName: { [Op.iLike]: word } };
        }),
      ],
    },
  });
  return res
    .status(200)
    .json({ data: users.map(({ dataValues }) => getUser(dataValues)) });
});

router.get("/:id", async (req, res) => {
  const user = await User.findOne({ where: { id: +req.params.id } });
  if (!user || !user.dataValues) {
    return res.status(404).json({ error: "not_found" });
  }
  return res.status(200).json({ data: getUser(user.dataValues) });
});

router.get("/", async (req, res) => {
  const userId = getId(req, res);
  const { dataValues } = await User.findOne({ where: { id: userId } });
  return res.status(200).json({ data: getUser(dataValues) });
});

module.exports = router;
