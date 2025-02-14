const multer = require("multer");
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const Recipe = require("../models/Recipe");
const User = require("../models/User.js")

const s3 = new S3Client({ region: process.env.AWS_REGION });

// Set up multer for handling form data
const storage = multer.memoryStorage();
const upload = multer({ storage: storage }).single("image");  // 'image' is the field name in the form

exports.createRecipe = (req, res) => {
  // Use multer middleware to handle the file upload
  upload(req, res, async (err) => {
    if (err) {
      return res.status(500).json({ error: "Error uploading image." });
    }

    try {
      const { title, description, ingredients, instructions } = req.body;

      // Validate required fields
      if (!title || !description || !ingredients || !instructions) {
        return res.status(400).json({ error: "All fields except image are required." });
      }

      // Ensure AWS configuration
      if (!process.env.AWS_S3_BUCKET_NAME || !process.env.AWS_REGION) {
        return res.status(500).json({ error: "S3 configuration is missing." });
      }

      let imageUrl = "";

      // Handle image upload if provided
      if (req.file) {
        const buffer = req.file.buffer;  // Multer puts the file buffer here
        const fileName = `${Date.now()}.jpg`;

        const uploadParams = {
          Bucket: process.env.AWS_S3_BUCKET_NAME,
          Key: fileName,
          Body: buffer,
          ContentType: "image/jpeg",
        };

        try {
          await s3.send(new PutObjectCommand(uploadParams));
          imageUrl = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;
        } catch (err) {
          return res.status(500).json({ error: "Error uploading image to S3." });
        }
      }

      // Use ingredients directly as a string
      const parsedIngredients = ingredients;

      // Create and save the recipe
      const recipe = new Recipe({
        title,
        description,
        ingredients: parsedIngredients,  // No need to parse anymore
        instructions,
        author: req.userId,
        imageUrl,
      });
      

      await recipe.save();
      res.status(201).json(recipe);
    } catch (error) {
      console.error("Error in createRecipe:", error);
      res.status(400).json({ error: error.message });
    }
  });
};


// Get all recipes
exports.getAllRecipes = async (req, res) => {
  try {
    const recipes = await Recipe.find().populate("author", "username");
    res.json(recipes);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get a single recipe by ID
exports.getRecipeById = async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id).populate(
      "author",
      "username"
    );
    if (!recipe) throw new Error("Recipe not found");
    res.json(recipe);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Add recipe to favorites
exports.addToFavorites = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) throw new Error("User not found");

    const recipe = await Recipe.findById(req.params.recipeId);
    if (!recipe) throw new Error("Recipe not found");

    if (!user.favoriteRecipes.includes(recipe._id)) {
      user.favoriteRecipes.push(recipe._id);
      await user.save();
    }
    res.json({ message: "Recipe added to favorites" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
exports.addToCollection = async (req, res) => {
  try {
    const { collectionType } = req.body; // e.g., "breakfast", "lunch"
    const { recipeId } = req.params;
    const user = await User.findById(req.userId);

    if (!user) return res.status(404).json({ error: "User not found" });

    if (!["breakfast", "lunch", "dinner", "dessert"].includes(collectionType)) {
      return res.status(400).json({ error: "Invalid collection type" });
    }

    if (!user.collections[collectionType].includes(recipeId)) {
      user.collections[collectionType].push(recipeId);
      await user.save();
    }

    res.json({ message: "Recipe added to collection successfully!" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Add a comment to a recipe
exports.addComment = async (req, res) => {
  try {
    const { text } = req.body;
    const recipe = await Recipe.findById(req.params.id);

    if (!recipe) {
      return res.status(404).json({ error: "Recipe not found." });
    }

    console.log(req.userId)

    const comment = {
      text,
      user: req.userId,
      createdAt: new Date(),
    };

    recipe.comments.push(comment);
    await recipe.save();

    res.status(201).json(comment);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getComments = async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id).populate("comments.user", "username");
    if (!recipe) {
      return res.status(404).json({ error: "Recipe not found." });
    }
    res.json(recipe.comments);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};


// Get recipes posted by the logged-in user
exports.getMyRecipes = async (req, res) => {
  try {
    const userId = req.user._id; // Get user ID from the request's user object (assuming user is authenticated)
    const recipes = await Recipe.find({ author: userId });
    res.status(200).json(recipes);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch recipes" });
  }
};

// Delete a recipe
exports.deleteRecipe = async (req, res) => {
  try {
    const recipeId = req.params.id;
    const recipe = await Recipe.findByIdAndDelete(recipeId);

    if (!recipe) {
      return res.status(404).json({ error: "Recipe not found" });
    }

    res.status(200).json({ message: "Recipe deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete the recipe" });
  }
};

// Update a recipe (you can extend this to update specific fields)
exports.updateRecipe = async (req, res) => {
  try {
    const recipeId = req.params.id;
    const updatedRecipe = await Recipe.findByIdAndUpdate(recipeId, req.body, { new: true });

    if (!updatedRecipe) {
      return res.status(404).json({ error: "Recipe not found" });
    }

    res.status(200).json(updatedRecipe);
  } catch (error) {
    res.status(500).json({ error: "Failed to update the recipe" });
  }
};


// Controller to get the favorite recipes for a user
exports.getFavoriteRecipes = async (req, res) => {
  try {
    const userId = req.userId; // The user ID is set by the authMiddleware

    // Find the user by their ID
    const user = await User.findById(userId).populate('favoriteRecipes'); // Populate the 'favorites' field with actual recipe data

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // If the user exists, send the populated favorite recipes
    res.status(200).json(user.favoriteRecipes); // user.favorites is an array of Recipe objects
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch favorite recipes' });
  }
};

exports.getCollectionRecipes = async (req, res) => {
  try {
    const { collectionType } = req.params;
    const user = await User.findById(req.userId).populate(`collections.${collectionType}`);

    if (!user) return res.status(404).json({ error: "User not found" });

    if (!["breakfast", "lunch", "dinner", "dessert"].includes(collectionType)) {
      return res.status(400).json({ error: "Invalid collection type" });
    }

    res.status(200).json(user.collections[collectionType]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
