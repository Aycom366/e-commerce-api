const { StatusCodes } = require("http-status-codes");
const User = require("../models/User");
const CustomError = require("../errors");
const { attachCookieToResponse, createTokenUser } = require("../utils");

const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new CustomError.BadRequestError("Please provide email and password");
  }

  const user = await User.findOne({ email });
  if (!user) {
    throw new CustomError.UnauthenticatedError("Invalid email or password");
  }

  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    throw new CustomError.BadRequestError("Invalid email or password");
  }

  //pass in what you need later on
  const tokenUser = createTokenUser(user);

  //in this case, using cookies
  attachCookieToResponse({ res, user: tokenUser });

  res.status(200).json({ user: tokenUser });
};

const logout = async (req, res) => {
  // res.clearCookie("token");
  // res.status(StatusCodes.OK).json({ message: "Logged out successfully" });
  res.cookie("token", "logout", {
    httpOnly: true,
    expires: new Date(Date.now()),
  });
  res.status(200).json({ msg: "Logged out successfully" });
};

const register = async (req, res) => {
  const { email, name, password } = req.body;
  const emailAlreadyExists = await User.findOne({ email });
  if (emailAlreadyExists) {
    throw new CustomError.BadRequestError("Email already exists");
  }

  //first registered user is an admin
  const isFirstAccount = (await User.countDocuments({})) === 0;
  console.log(isFirstAccount);
  const role = isFirstAccount ? "admin" : "user";

  const user = await User.create({ name, email, password, role });

  //pass in what you need later on
  const tokenUser = createTokenUser(user);

  //in this case, using cookies
  attachCookieToResponse({ res, user: tokenUser });

  res.status(201).json({ user: tokenUser });
};

module.exports = { login, logout, register };
