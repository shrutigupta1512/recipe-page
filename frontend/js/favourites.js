const API_BASE_URL = "http://localhost:5000/api"; // Adjust based on your backend URL
const favoritesList = document.getElementById('favorites-list');
const authButton = document.getElementById('auth-button');

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

// Function to fetch and display favorite recipes
async function fetchFavorites() {
  const token = localStorage.getItem("token");
  if (!token) return;

  const response = await fetch(`${API_BASE_URL}/recipes/fav/recipes`, {
    headers: {
      "Authorization": `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (response.ok) {
    displayFavorites(data);
  } else {
    favoritesList.innerHTML = "<p>No favorite recipes found or unable to fetch favorites.</p>";
  }
}
function createCollectionDropdown(recipeId) {
  const dropdown = document.createElement("select");
  dropdown.innerHTML = `
    <option value="">Add to Collection</option>
    <option value="breakfast">Breakfast</option>
    <option value="lunch">Lunch</option>
    <option value="dinner">Dinner</option>
    <option value="dessert">Dessert</option>
  `;

   // Prevent dropdown click from triggering card click event
   dropdown.addEventListener("click", (event) => {
    event.stopPropagation();
  });

  dropdown.addEventListener("change", async (event) => {
    event.stopPropagation(); // Prevents redirect when selecting an option
    const collectionType = event.target.value;
    if (!collectionType) return;

    const token = localStorage.getItem("token");
    if (!token) {
      alert("Please login to continue");
      return;
    }

    const response = await fetch(`${API_BASE_URL}/recipes/${recipeId}/add-to-collection`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ collectionType }),
    });

    const data = await response.json();
    if (response.ok) {
      alert("Recipe added to " + collectionType);
    } else {
      alert(data.error);
    }
    // Reset dropdown after selection
    event.target.value = "";
  });

  return dropdown;
}

// Function to display the favorite recipes
function displayFavorites(favorites) {
  favoritesList.innerHTML = '';
  favorites.forEach(recipe => {
    const recipeCard = document.createElement('div');
    recipeCard.className = 'recipe-card';

    recipeCard.innerHTML = `
      <img src="${recipe.imageUrl || 'default-image-url.jpg'}" alt="${recipe.title}" class="recipe-image">
      <h3>${recipe.title}</h3>
      <p>${recipe.description}</p>
      <button class="unfavorite-btn">Unfavorite</button>
    `;

    // Redirect to recipe.html with the recipe ID when clicking the recipe card
    recipeCard.addEventListener('click', () => {
      window.location.href = `recipe.html?id=${recipe._id}`;
    });
// Add collection dropdown
const dropdown = createCollectionDropdown(recipe._id);
recipeCard.appendChild(dropdown);
    // Add functionality for the "Unfavorite" button
    const unfavoriteButton = recipeCard.querySelector('.unfavorite-btn');
    unfavoriteButton.addEventListener('click', async (e) => {
      e.stopPropagation();  // Prevent the click from triggering the redirect

      const token = localStorage.getItem("token");
      if (!token) {
        alert("Please log in to unfavorite.");
        return;
      }

      const response = await fetch(`${API_BASE_URL}/recipes/${recipe._id}/unfavorite`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        alert("Recipe removed from favorites!");
        fetchFavorites();  // Refresh the favorites list
      } else {
        alert("Failed to remove recipe from favorites.");
      }
    });

    favoritesList.appendChild(recipeCard);
  });
}

// Fetch and display favorite recipes when the page loads
fetchFavorites();
