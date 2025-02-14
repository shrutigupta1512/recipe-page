const API_BASE_URL = "http://localhost:5000/api";
const myRecipesList = document.getElementById("my-recipes-list");
const authButton = document.getElementById("auth-button");



// Check if the user is logged in
if (localStorage.getItem("token")) {
  authButton.textContent = "Logout";
  authButton.onclick = () => {
    localStorage.removeItem("token");
    window.location.href = "login.html";
  };
} else {
  authButton.textContent = "Login";
  authButton.onclick = () => {
    window.location.href = "login.html";
  };
}

// Function to fetch and display recipes
async function fetchMyRecipes() {
  const token = localStorage.getItem("token");
  if (!token) return;

  const response = await fetch(`${API_BASE_URL}/recipes/my-recipes`, {
    headers: {
      "Authorization": `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (response.ok) {
    displayRecipes(data);
  } else {
    myRecipesList.innerHTML = "<p>No recipes found or unable to fetch recipes.</p>";
  }
}

// Function to display the recipes
function displayRecipes(recipes) {
  myRecipesList.innerHTML = "";
  recipes.forEach(recipe => {
    const recipeElement = document.createElement("div");
    recipeElement.classList.add("recipe");

    // Show the image if available
    if (recipe.imageUrl) {
      const image = document.createElement("img");
      image.src = recipe.imageUrl;
      image.alt = recipe.title;
      image.classList.add("recipe-image");
      recipeElement.appendChild(image);
    }

    const title = document.createElement("h3");
    title.textContent = recipe.title;

    const description = document.createElement("p");
    description.textContent = recipe.description;

    const actions = document.createElement("div");
    actions.classList.add("actions");

    const editButton = document.createElement("button");
    editButton.textContent = "Edit";
    editButton.onclick = () => {
      // Redirect to post-recipe page with pre-filled data
      window.location.href = `post-recipe.html?recipeId=${recipe._id}&title=${encodeURIComponent(recipe.title)}&description=${encodeURIComponent(recipe.description)}&imageUrl=${encodeURIComponent(recipe.imageUrl)}`;
    };

    const deleteButton = document.createElement("button");
    deleteButton.textContent = "Delete";
    deleteButton.onclick = () => {
      deleteRecipe(recipe._id);
    };

    actions.appendChild(editButton);
    actions.appendChild(deleteButton);

    recipeElement.appendChild(title);
    recipeElement.appendChild(description);
    recipeElement.appendChild(actions);

    myRecipesList.appendChild(recipeElement);
  });
}

// Function to delete a recipe
async function deleteRecipe(recipeId) {
  const token = localStorage.getItem("token");
  if (!token) return;

  const response = await fetch(`${API_BASE_URL}/recipes/${recipeId}`, {
    method: "DELETE",
    headers: {
      "Authorization": `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (response.ok) {
    alert("Recipe deleted successfully!");
    fetchMyRecipes(); // Refresh the recipes list
  } else {
    alert("Failed to delete the recipe.");
  }
}



// Fetch and display the recipes when the page loads
fetchMyRecipes();
