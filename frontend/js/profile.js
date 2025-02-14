const API_BASE_URL = "http://localhost:5000/api/auth";
const token = localStorage.getItem("token");

// Fetch user data and preload the form
const fetchUserData = async () => {
  if (!token) {
    alert("Please login to view your profile");
    window.location.href = "login.html";
    return;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const user = await response.json();

    if (response.ok) {
      document.getElementById("username").value = user.username;
      document.getElementById("email").value = user.email;
    } else {
      alert("Failed to fetch user data");
    }
  } catch (error) {
    console.error("Error fetching user data:", error);
  }
};

// Update profile
document.getElementById("profile-form")?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const username = document.getElementById("username").value;

  try {
    const response = await fetch(`${API_BASE_URL}/update-profile`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ username }),
    });

    const data = await response.json();
    if (response.ok) {
      document.getElementById("profile-message").textContent = "Profile updated successfully!";
    } else {
      document.getElementById("profile-message").textContent = data.error || "Failed to update profile";
    }
  } catch (error) {
    console.error("Error updating profile:", error);
  }
});

// Forgot Password
document.getElementById("forgot-password-button")?.addEventListener("click", () => {
  const email = document.getElementById("email").value;
  window.location.href = `forgot-password.html?email=${encodeURIComponent(email)}`;
});

// Logout
document.getElementById("logout-button")?.addEventListener("click", () => {
  localStorage.removeItem("token");
  window.location.href = "login.html";
});

// Fetch user data on page load
fetchUserData();