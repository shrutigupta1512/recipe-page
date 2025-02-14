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


async function fetchCollection(collectionType) {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Please log in to view collections.");
      return;
    }
  
    const response = await fetch(`${API_BASE_URL}/recipes/collection/${collectionType}`, {
      headers: { "Authorization": `Bearer ${token}` },
    });
  
    const data = await response.json();
    displayCollection(data);
  }
  
  function displayCollection(recipes) {
    const collectionList = document.getElementById("collection-list");
    collectionList.innerHTML = '';
  
    if (recipes.length === 0) {
      collectionList.innerHTML = "<p>No recipes found in this collection.</p>";
      return;
    }
  
    recipes.forEach(recipe => {
      const recipeCard = document.createElement('div');
      recipeCard.className = 'recipe-card';
  
      recipeCard.innerHTML = `
        <img src="${recipe.imageUrl || 'default-image-url.jpg'}" alt="${recipe.title}" class="recipe-image">
        <h3>${recipe.title}</h3>
        <p>${recipe.description}</p>
      `;
  
      recipeCard.addEventListener('click', () => {
        window.location.href = `recipe.html?id=${recipe._id}`;
      });
  
      collectionList.appendChild(recipeCard);
    });
  }
  