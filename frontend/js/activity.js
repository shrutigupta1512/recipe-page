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


document.addEventListener("DOMContentLoaded", async () => {
    const activityFeedList = document.getElementById("activity-feed");
    const token = localStorage.getItem("token");
  
    if (!token) {
      activityFeedList.innerHTML = "<p>Please log in to see activity feed.</p>";
      return;
    }
  
    try {
      const response = await fetch(`${API_BASE_URL}/users/activity-feed`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
  
      const activity = await response.json();
      if (activity.length === 0) {
        activityFeedList.innerHTML = "<p>No new activity.</p>";
        return;
      }
  
      activityFeedList.innerHTML = activity.map(a => `
        <p>${a.user.username} posted a new recipe: <a href="recipe.html?id=${a.recipe._id}">${a.recipe.title}</a></p>
      `).join("");
    } catch (error) {
      activityFeedList.innerHTML = "<p>Error loading activity feed.</p>";
    }
  });