const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

//validating our models
const validator = require("validator");

const UserShema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please provide name"],
    minlength: 3,
    maxlength: 50,
  },
  email: {
    type: String,
    unique: true,
    required: [true, "Please provide email"],

    //custom validations, extending
    validate: {
      validator: validator.isEmail,
      message: "Please provide a valid email",
    },
  },
  password: {
    type: String,
    required: [true, "Please provide password"],
    minlength: 6,
  },
  role: {
    type: String,
    enum: ["user", "admin", "owner"],
    default: "user",
  },
});

//before we save the docs, presave
UserShema.pre("save", async function () {
  // console.log(this.modifiedPaths());
  // console.log(this.isModified("password"));

  if (!this.modifiedPaths("password")) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

UserShema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

//User here will be the name of the collection that will be created
module.exports = mongoose.model("User", UserShema);
