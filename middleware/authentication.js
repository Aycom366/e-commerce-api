const CustomError = require("../errors");
const { isTokenValid } = require("../utils");
const jwt = require("jsonwebtoken");

const authenticateUser = async (req, res, next) => {
  const token = req.signedCookies.token;
  if (!token) {
    throw new CustomError.UnauthenticatedError("Unauthorized");
  }
  try {
    //check if token is valid
    const { name, userId, role } = isTokenValid(token);

    //inject user to the req and pass
    req.user = { name, userId, role };
    next();
  } catch (error) {
    throw new CustomError.UnauthenticatedError("Unauthorized");
  }
};

//authenticating users now
// ...roles gets arguments passed from where this function is being called
//checking for multiple role values
const authorizePermissions = (...roles) => {
  return (req, res, next) => {
    const { role } = req.user;
    if (!roles.includes(role)) {
      throw new CustomError.Unauthorized("Unauthorized to access this route");
    }
    next();
  };
};

module.exports = { authenticateUser, authorizePermissions };
