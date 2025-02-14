const API_BASE_URL = "http://localhost:5000/api";

document.addEventListener("DOMContentLoaded", () => {
  fetchRecipes();
  setupUpdateForm();
});

// Fetch all recipes and display in the table
async function fetchRecipes() {
  try {
    const response = await fetch(`${API_BASE_URL}/recipes`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    const recipes = await response.json();
    const recipesList = document.getElementById("recipes-list");
    recipesList.innerHTML = recipes
      .map(
        (recipe) => `
      <tr>
        <td>${recipe._id}</td>
        <td>${recipe.title}</td>
        <td>${recipe.description}</td>
        <td>
          <button onclick="showUpdateForm('${recipe._id}', '${recipe.title}', '${recipe.description}')">Edit</button>
          <button onclick="deleteRecipe('${recipe._id}')">Delete</button>
        </td>
      </tr>`
      )
      .join("");
  } catch (error) {
    console.error("Error fetching recipes:", error);
  }
}

// Show the update form with pre-filled data
function showUpdateForm(id, title, description) {
  document.getElementById("update-id").value = id;
  document.getElementById("update-title").value = title;
  document.getElementById("update-description").value = description;
  document.getElementById("update-form").style.display = "block";
}

// Setup update form submission
function setupUpdateForm() {
  const form = document.getElementById("recipe-update-form");
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const id = document.getElementById("update-id").value;
    const title = document.getElementById("update-title").value;
    const description = document.getElementById("update-description").value;

    try {
      const response = await fetch(`${API_BASE_URL}/recipes/update/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ title, description }),
      });

      if (response.ok) {
        alert("Recipe updated successfully!");
        fetchRecipes();
        document.getElementById("update-form").style.display = "none";
      } else {
        const errorData = await response.json();
        alert(`Error updating recipe: ${errorData.error}`);
      }
    } catch (error) {
      console.error("Error updating recipe:", error);
    }
  });
}

// Delete a recipe
async function deleteRecipe(id) {
  if (!confirm("Are you sure you want to delete this recipe?")) return;

  try {
    const response = await fetch(`${API_BASE_URL}/recipes/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });

    if (response.ok) {
      alert("Recipe deleted successfully!");
      fetchRecipes();
    } else {
      const errorData = await response.json();
      alert(`Error deleting recipe: ${errorData.error}`);
    }
  } catch (error) {
    console.error("Error deleting recipe:", error);
  }
}
