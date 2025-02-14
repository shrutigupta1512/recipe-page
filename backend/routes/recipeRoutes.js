const express = require("express");
const recipeController = require("../controllers/recipeController");
const authMiddleware = require("../middleware/authMiddleware.js");
const Recipe = require("../models/Recipe");
const User = require("../models/User.js")

const router = express.Router();
router.post("/:id/comments", authMiddleware, recipeController.addComment);
// GET - Fetch recipes created by the logged-in user
router.get("/my-recipes", authMiddleware, async (req, res) => {
  try {
    const recipes = await Recipe.find({ author: req.userId }); // `req.userId` should be set by your authMiddleware
    if (!recipes.length) {
      return res.status(404).json({ error: "No recipes found for this user" });
    }
    res.status(200).json(recipes);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch recipes" });
  }
});
router.get('/search', async (req, res) => {
    const { query } = req.query;
    console.log("asdfvb hasdfhvsdahf")
  
    if (!query) {
      return res.status(400).json({ error: 'Search query is required.' });
    }
  
    try {
      console.log('Search query:', query);
  
      const recipes = await Recipe.find({
        $or: [
            { title: { $regex: query, $options: 'i' } }, // Search by title
            { ingredients: { $regex: query, $options: 'i' } } // Search by ingredients
        ]
    });
  
      if (recipes.length === 0) {
        return res.status(404).json({ error: 'No recipes found.' });
      }
  
      res.status(200).json(recipes);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to search recipes.' });
    }
  });
router.post("/", authMiddleware, recipeController.createRecipe);
router.get("/", recipeController.getAllRecipes);
router.get("/:id", recipeController.getRecipeById);
router.get("/fav/recipes", authMiddleware, recipeController.getFavoriteRecipes)
router.post("/:recipeId/favorite", authMiddleware, recipeController.addToFavorites);
router.post("/:recipeId/add-to-collection", authMiddleware, recipeController.addToCollection);
router.get("/collection/:collectionType", authMiddleware, recipeController.getCollectionRecipes);


// In your recipe controller
router.post("/:recipeId/unfavorite", authMiddleware, async (req, res) => {
  try {
    const { recipeId } = req.params;
    const userId = req.userId;

    // Remove the recipe from the user's favorites list
    const user = await User.findById(userId);
    user.favoriteRecipes = user.favoriteRecipes.filter(fav => fav.toString() !== recipeId);
    await user.save();

    res.status(200).json({ message: "Recipe removed from favorites" });
  } catch (error) {
    res.status(500).json({ error: "Failed to unfavorite recipe" });
  }
});


router.get("/:id/comments", recipeController.getComments);



// DELETE - Delete a recipe by its ID
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);

    if (!recipe) {
      return res.status(404).json({ error: "Recipe not found" });
    }

    // Ensure the logged-in user is the owner of the recipe
    if (recipe.author.toString() !== req.userId) {
      return res.status(403).json({ error: "You do not have permission to delete this recipe" });
    }

    await recipe.deleteOne();
    res.status(200).json({ message: "Recipe deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete the recipe" });
  }
});

// PUT - Update a recipe by its ID
router.put("/recipes/update/:id", authMiddleware, async (req, res) => {

  console.log("Update Request for Recipe ID:", req.params.id);
  console.log("Received Data:", req.body);
  try {
    const recipe = await Recipe.findById(req.params.id);

    if (!recipe) {
      return res.status(404).json({ error: "Recipe not found" });
    }
    const userId = req.userId;

    const user = await User.findById(userId);
    console.log(user.role, userId, recipe.author)
    // Ensure the logged-in user is the owner of the recipe
    if (user.role !== "admin" && recipe.author.toString() !== req.userId) {
      return res.status(403).json({ error: "You do not have permission to update this recipe" });
    }
    

    // Update the recipe
    const updatedRecipe = await Recipe.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json(updatedRecipe);
  } catch (error) {
    res.status(500).json({ error: "Failed to update the recipe" });
  }
});
  
  

module.exports = router;