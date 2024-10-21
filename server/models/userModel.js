const mongoose = require("mongoose");

const schema = mongoose.Schema(
  {
    name: {
      type: String,
    },
    email: {
      type: String,
    },
    password: {
      type: String,
    },
    profilePicture: { type: String, default: "" },
    favorites: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Recipe",
      },
    ],
    roles: {
      type: [String],
      default: ["BasicUser"],
    },
    isDisabled: { type: Boolean, default: false },
    refreshToken: { type: [String] },
  },
  {
    timestamps: true,
  }
);

// Cambia el nombre de la colección aquí
const User = mongoose.model("User", schema, "recipen_users");
module.exports = User;
