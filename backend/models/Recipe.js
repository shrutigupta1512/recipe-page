const mongoose = require('mongoose');

// Assuming you have a User model
const User = require('./User');  // Adjust the path based on your project structure

const commentSchema = new mongoose.Schema({
  text: String,
  createdAt: { type: Date, default: Date.now },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },  // Reference to the User model
});

const recipeSchema = new mongoose.Schema({
  title: String,
  description: String,
  ingredients: [{ type: String }],
  instructions: String,
  imageUrl: String,
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  comments: [commentSchema],
});

module.exports = mongoose.model('Recipe', recipeSchema);
