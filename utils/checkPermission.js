const CustomError = require("../errors");

const checkPermission = (requestUser, resourceUserId) => {
  //   console.log(requestUser);
  //   console.log(resourceUserId);
  //   console.log(typeof resourceUserId);

  // unless the user is an admin, they can only access their own data

  if (requestUser.role === "admin") return true;

  if (requestUser.userId === resourceUserId.toString()) return true;

  throw new CustomError.Unauthorized("Not authorized to access this route");
};

module.exports = checkPermission;
