/* ============================
   MENU.JS — NAVIGATION CONTROL
   ============================ */

// Elements
const hamburger = document.getElementById("hamburger");
const mobileMenu = document.getElementById("mobileMenu");

// Toggle Mobile Menu
if (hamburger) {
  hamburger.addEventListener("click", () => {
    mobileMenu.style.display =
      mobileMenu.style.display === "block" ? "none" : "block";
  });
}

// Close menu on link click
if (mobileMenu) {
  mobileMenu.addEventListener("click", (e) => {
    if (e.target.tagName === "A") {
      mobileMenu.style.display = "none";
    }
  });
}

// Close menu when clicking outside (optional)
document.addEventListener("click", (e) => {
  if (
    mobileMenu &&
    hamburger &&
    !mobileMenu.contains(e.target) &&
    !hamburger.contains(e.target)
  ) {
    mobileMenu.style.display = "none";
  }
});

/* ============================
   PROFILE DROPDOWN (Desktop)
   ============================ */

const dropdown = document.querySelector(".dropdown");
const dropdownMenu = document.querySelector(".dropdown-menu");

if (dropdown && dropdownMenu) {
  dropdown.addEventListener("click", (e) => {
    e.stopPropagation();
    dropdownMenu.style.display =
      dropdownMenu.style.display === "block" ? "none" : "block";
  });

  // hide on outside click
  document.addEventListener("click", () => {
    dropdownMenu.style.display = "none";
  });
}
// menu.js — global navigation helper functions

function goToLogin() {
  window.location.href = "login.html";
}

function goToSignup() {
  window.location.href = "signup.html";
}

function goToProfile() {
  window.location.href = "profile.html";
}

function logout() {
  localStorage.removeItem("eshop_token");
  localStorage.removeItem("eshop_user");
  window.location.href = "login.html";
}
