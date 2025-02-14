const API_BASE_URL = "http://localhost:5000/api/recipes";

const API_BASE_URL_AUTH = "http://localhost:5000/api/auth";

const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';




// Function to check if the user is an admin and show the Admin Dashboard button
async function checkAdminRole() {
  const token = localStorage.getItem('token');
  if (token) {
    try {
      const response = await fetch(`${API_BASE_URL_AUTH}/me`, {
        method: "GET",
        headers: { "Authorization": `Bearer ${token}` }
      });
      const user = await response.json();

      if (response.ok && user.role === 'admin') {
        document.getElementById('admin-dashboard-btn').style.display = 'inline'; // Show Admin button
      }
    } catch (error) {
      console.error("Failed to check admin role:", error);
    }
  }
}

// Function to update the UI based on login status
function updateNavButtons() {
  console.log("called by ayush");
  if (isLoggedIn) {
    document.getElementById('login-btn').style.display = 'none';
    document.getElementById('signup-btn').style.display = 'none';
    document.getElementById('logout-btn').style.display = 'inline'; // Show logout button
    checkAdminRole(); // Check for admin role
  } else {
    document.getElementById('login-btn').style.display = 'inline';
    document.getElementById('signup-btn').style.display = 'inline';
    document.getElementById('logout-btn').style.display = 'none'; // Hide logout button
    document.getElementById('admin-dashboard-btn').style.display = 'none'; // Hide Admin button
  }
}

// Call the function to update the buttons on page load
document.addEventListener("DOMContentLoaded", () => {
  updateNavButtons(); 
  checkAdminRole(); 
});

// Fetch all recipes
const fetchRecipes = async () => {
  try {
    const response = await fetch(API_BASE_URL);
    if (!response.ok) {
      throw new Error(`Error fetching recipes: ${response.statusText}`);
    }
    const recipes = await response.json();
    renderRecipes(recipes);
  } catch (error) {
    console.error('Error:', error);
    const recipesList = document.getElementById('recipes-list');
    recipesList.innerHTML = `<p class="error-message">Failed to load recipes. Please try again later.</p>`;
  }
};


 document.getElementById("post-recipe-form")?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const token = localStorage.getItem("token");
  if (!token) {
    alert("Please login to post a recipe");
    return;
  }

  const formData = new FormData();
  formData.append("title", document.getElementById("title").value);
  formData.append("description", document.getElementById("description").value);
  formData.append("ingredients", document.getElementById("ingredients").value.split(","));
  formData.append("instructions", document.getElementById("instructions").value);
  
  const imageFile = document.getElementById("image").files[0];
  if (imageFile) {
    formData.append("image", imageFile);
  }

  const response = await fetch(`${API_BASE_URL}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  const data = await response.json();
  if (response.ok) {
    document.getElementById("post-recipe-message").textContent = "Recipe posted successfully!";
    setTimeout(() => {
      window.location.href = "index.html";
    }, 2000);
  } else {
    document.getElementById("post-recipe-message").textContent = data.error;
  }
});

// Render all recipes
function renderRecipes(recipes) {
  const recipesList = document.getElementById('recipes-list');
  console.log("clicked");
  recipesList.innerHTML = '';

  recipes.forEach(recipe => {
    const recipeCard = document.createElement('div');
    recipeCard.className = 'recipe-card';

    recipeCard.innerHTML = `
     <h4 class="recipe-username">Posted by: ${recipe.author?.username || "Unknown"}</h4>

      <img src="${recipe.imageUrl || 'default-image-url.jpg'}" alt="${recipe.title}" class="recipe-image">
      <h3>${recipe.title}</h3>
      <p>${recipe.description}</p>
      <button class="add-to-favorites-btn">Add to Favorites</button>
    `;
    

    // Redirect to recipe.html with the recipe ID when clicking the recipe card
    recipeCard.addEventListener('click', () => {
      window.location.href = `recipe.html?id=${recipe._id}`;
    });

    // Add functionality for the "Add to Favorites" button
    const addToFavoritesButton = recipeCard.querySelector('.add-to-favorites-btn');
    addToFavoritesButton.addEventListener('click', async (e) => {
      e.stopPropagation();  // Prevent the click from triggering the redirect

      const token = localStorage.getItem("token");
      if (!token) {
        alert("Please log in to add to favorites.");
        return;
      }

      const response = await fetch(`${API_BASE_URL}/${recipe._id}/favorite`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        alert("Recipe added to favorites!");
      } else {
        alert("Failed to add recipe to favorites.");
      }
    });

    recipesList.appendChild(recipeCard);
  });
}




// Fetch recipes on page load
document.addEventListener('DOMContentLoaded', () => {
  // if (document.getElementById('recipes-list')) {
    fetchRecipes();
  // }
});
// Utility to show status messages
const showStatusMessage = (message, type) => {
  const statusMessageDiv = document.getElementById("status-message");
  statusMessageDiv.textContent = message;
  statusMessageDiv.className = type === "error" ? "status-error" : "status-success";
  setTimeout(() => {
    statusMessageDiv.textContent = "";
  }, 3000);
};

// Fetch and display a single recipe
const fetchRecipe = async (recipeId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/${recipeId}`);
    if (!response.ok) throw new Error("Failed to fetch recipe.");

    const recipe = await response.json();
    document.getElementById("recipe-title").textContent = recipe.title;
    document.getElementById("recipe-image").src = recipe.imageUrl || "";
    document.getElementById("recipe-image").style.display = recipe.imageUrl ? "block" : "none";
    document.getElementById("recipe-description").textContent = recipe.description;
    document.getElementById("recipe-instructions").textContent = recipe.instructions;
    document.getElementById("recipe-ingredients").innerHTML = recipe.ingredients
      .map((ingredient) => `<li>${ingredient}</li>`)
      .join("");
    document.getElementById("recipe-instructions").textContent = recipe.instructions;

    fetchComments(recipeId);
  } catch (error) {
    showStatusMessage("Error fetching recipe: " + error.message, "error");
  }
};

// Fetch comments for a specific recipe
const fetchComments = async (recipeId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/${recipeId}/comments`);
    if (!response.ok) throw new Error("Failed to fetch comments.");

    const comments = await response.json();
    const commentsList = document.getElementById("comments-list");
    commentsList.innerHTML = comments
      .map((comment) => `<li><strong>${comment?.user?.username}:</strong> ${comment.text}</li>`)
      .join("");
  } catch (error) {
    showStatusMessage("Error fetching comments: " + error.message, "error");
  }
};

// Submit a new comment
document.getElementById("comment-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const token = localStorage.getItem("token");
  if (!token) {
    showStatusMessage("Please login to post a comment.", "error");
    return;
  }

  const commentText = document.getElementById("comment-text").value.trim();
  if (!commentText) {
    showStatusMessage("Comment cannot be empty.", "error");
    return;
  }

  const recipeId = new URLSearchParams(window.location.search).get("id");
  try {
    const response = await fetch(`${API_BASE_URL}/${recipeId}/comments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ text: commentText }),
    });

    if (response.ok) {
      showStatusMessage("Comment posted successfully!", "success");
      document.getElementById("comment-text").value = "";
      fetchComments(recipeId); // Refresh comments list
    } else {
      throw new Error("Failed to post comment.");
    }
  } catch (error) {
    showStatusMessage("Error posting comment: " + error.message, "error");
  }
});


// Fetch recipe details on page load
document.addEventListener('DOMContentLoaded', () => {
  const recipeId = new URLSearchParams(window.location.search).get('id');
  console.log('Location Search:', window.location.search); // Check if query params are being read
  console.log('Recipe ID:', recipeId); // Check if 'id' parameter is being extracted

  if (recipeId) {
    console.log("Fetching recipe for ID: ", recipeId);
    fetchRecipe(recipeId);
  } else {
    console.log("No recipe ID found in the URL.");
  }
});




