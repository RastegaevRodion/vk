const jwt = require("jsonwebtoken");
const { tokenSecret } = require("../constants");

const getId = (req, res) => {
  if (!req.cookies.jwt) {
    return res.status(401).json({ error: "not_authorized" });
  }
  const { userId } = jwt.verify(req.cookies.jwt, tokenSecret);
  if (!userId) {
    return res.status(401).json({ error: "not_authorized" });
  }
  return userId;
};

module.exports = getId;
