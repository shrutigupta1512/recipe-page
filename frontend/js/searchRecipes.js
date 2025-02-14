const API_BASE_URL = "http://localhost:5000/api";

document.getElementById('search-button').addEventListener('click', async () => {
    const query = document.getElementById('search-input').value.trim();
    if (!query) {
      alert('Please enter a search term');
      return;
    }
  
    const searchResultsDiv = document.getElementById('search-results');
    searchResultsDiv.innerHTML = 'Loading...';
  
    try {
      const response = await fetch(`${API_BASE_URL}/recipes/search?query=${encodeURIComponent(query)}`);
      const recipes = await response.json();
  
      if (response.ok) {
        if (recipes.length === 0) {
          searchResultsDiv.innerHTML = 'No recipes found.';
        } else {
          searchResultsDiv.innerHTML = recipes
            .map(recipe => `
              <div class="recipe-card" onclick="viewRecipe('${recipe._id}')">
                <h3>${recipe.title}</h3>
                <p>${recipe.description}</p>
                ${recipe.imageUrl ? `<img src="${recipe.imageUrl}" alt="${recipe.title}" class="recipe-image"/>` : ''}
              </div>
            `)
            .join('');
        }
      } else {
        searchResultsDiv.innerHTML = 'Error searching recipes.';
      }
    } catch (error) {
      console.error('Error:', error);
      searchResultsDiv.innerHTML = 'Error fetching search results.';
    }
});

// Function to navigate to the recipe page
function viewRecipe(recipeId) {
    window.location.href = `recipe.html?id=${recipeId}`;
}
