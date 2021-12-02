const express = require("express");
const router = express.Router();

const { login, register, logout } = require("../controllers/authController");

router.post("/login", login);
router.post("/register", register);
router.route("/logout").get(logout);

module.exports = router;
