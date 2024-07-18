const getUser = (user) => {
  const { password, ...rest } = user;
  return { ...rest };
};

module.exports = getUser;
