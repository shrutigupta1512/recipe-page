const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  favoriteRecipes: [{ type: mongoose.Schema.Types.ObjectId, ref: "Recipe" }],
  collections: {
    breakfast: [{ type: mongoose.Schema.Types.ObjectId, ref: "Recipe" }],
    lunch: [{ type: mongoose.Schema.Types.ObjectId, ref: "Recipe" }],
    dinner: [{ type: mongoose.Schema.Types.ObjectId, ref: "Recipe" }],
    dessert: [{ type: mongoose.Schema.Types.ObjectId, ref: "Recipe" }],
  },
  
  role : {type : String, default : "user"}
});

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

module.exports = mongoose.model("User", userSchema);