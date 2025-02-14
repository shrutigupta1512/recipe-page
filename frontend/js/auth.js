const API_BASE_URL = "http://localhost:5000/api/auth";

const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';

// Function to check if the user is an admin and show the Admin Dashboard button
async function checkAdminRole() {
  const token = localStorage.getItem('token');
  if (token) {
    try {
      const response = await fetch(`${API_BASE_URL}/me`, {
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


// Login
document.getElementById("login-form")?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  const response = await fetch(`${API_BASE_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json();
  if (response.ok) {
    localStorage.setItem("token", data.token);
    localStorage.setItem("isLoggedIn", "true");  // Mark the user as logged in
    window.location.href = "index.html";
  } else {
    document.getElementById("login-message").textContent = data.error;
  }
});

// Signup
document.getElementById("signup-form")?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const username = document.getElementById("username").value;
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  const response = await fetch(`${API_BASE_URL}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, email, password }),
  });

  const data = await response.json();
  if (response.ok) {
    document.getElementById("signup-message").textContent = "Signup successful!";
    window.location.href = "login.html";
  } else {
    document.getElementById("signup-message").textContent = data.error;
  }
});

// Logout



// Logout
document.getElementById("logout-btn")?.addEventListener("click", () => {
  if (confirm("Are you sure you want to logout?")) {
    localStorage.removeItem("token");
    localStorage.removeItem("isLoggedIn");
    window.location.href = "login.html";
  }
});


// This script should go in your recipe.js (or a separate file for handling authentication logic)

// Simulate checking if the user is logged in
// You can replace this with actual logic like checking for a valid token


