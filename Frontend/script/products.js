// products.js — fixed URL building (uses URL & URLSearchParams) + live search debounce
import { BASE_URL } from "./config.js";

let cart = JSON.parse(localStorage.getItem("shopcartdata")) || [];
let wishlist = JSON.parse(localStorage.getItem("shopwishlist")) || [];

let currentPage = 1;
let limit = 12;
let activeCategory = "";
let activeSearch = "";
let activeSort = "";

// debounce helper
function debounce(fn, delay = 300) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), delay);
  };
}

async function loadProducts(page = 1) {
  currentPage = page;

  try {
    const url = new URL("/api/products", BASE_URL);
    const params = url.searchParams;
    params.set("page", currentPage);
    params.set("limit", limit);

    if (activeCategory) params.set("category", activeCategory);
    else params.delete("category");

    if (activeSearch) params.set("search", activeSearch);
    else params.delete("search");

    if (activeSort === "LTH") {
      params.set("sort", "price");
      params.set("order", "asc");
    } else if (activeSort === "HTL") {
      params.set("sort", "price");
      params.set("order", "desc");
    } else if (activeSort === "A-Z") {
      params.set("sort", "title");
      params.set("order", "asc");
    } else if (activeSort === "Z-A") {
      params.set("sort", "title");
      params.set("order", "desc");
    } else {
      params.delete("sort");
      params.delete("order");
    }

    console.log("FETCH URL →", url.toString());

    const res = await fetch(url.toString());
    const result = await res.json();

    if (!result || !Array.isArray(result.data)) {
      console.error("Invalid response format", result);
      displayProducts([]);
      renderPagination(0, 1);
      return;
    }

    displayProducts(result.data);
    renderPagination(result.totalPages || 1, result.page || 1);
  } catch (err) {
    console.error("Fetch error:", err);
    displayProducts([]);
    renderPagination(0, 1);
  }
}

// initial load
loadProducts();

/* --- UI rendering functions --- */
function displayProducts(list) {
  const container = document.getElementById("products-container");
  if (!container) return;
  container.innerHTML = "";

  if (!list.length) {
    container.innerHTML = "<h2>No products found</h2>";
    return;
  }

  list.forEach(item => {
    const card = document.createElement("div");
    card.className = "product-card";

    let img = item.image;
    if (!img || !img.startsWith("http")) img = "./images/noimage.png";

    card.innerHTML = `
      <img src="${img}" alt="${escapeHtml(item.title || "product")}">
      <h3>${escapeHtml(item.title || "")}</h3>
      <p class="desc">${escapeHtml((item.description || "").slice(0, 80))}...</p>
      <p class="price">₹ ${item.price ?? "-"}</p>
      <div class="actions">
        <button class="btn-cart">Add to Cart</button>
        <button class="btn-wish">Wishlist</button>
      </div>
    `;

    card.querySelector(".btn-cart").addEventListener("click", () => addToCart(item));
    card.querySelector(".btn-wish").addEventListener("click", () => addToWishlist(item));
    container.appendChild(card);
  });
}

function renderPagination(totalPages, current) {
  const pagination = document.getElementById("pagination");
  if (!pagination) return;
  pagination.innerHTML = "";
  totalPages = Number(totalPages) || 0;
  current = Number(current) || 1;
  if (totalPages <= 1) return;

  if (current > 1) pagination.appendChild(createPageButton("Prev", current - 1));
  for (let i = 1; i <= totalPages; i++) {
    const btn = createPageButton(i, i);
    if (i === current) btn.classList.add("active");
    pagination.appendChild(btn);
  }
  if (current < totalPages) pagination.appendChild(createPageButton("Next", current + 1));
}
function createPageButton(text, page) {
  const btn = document.createElement("button");
  btn.textContent = text;
  btn.className = "page-btn";
  btn.addEventListener("click", () => loadProducts(page));
  return btn;
}

/* --- event bindings --- */
document.querySelectorAll(".filter-btn").forEach(b => {
  b.addEventListener("click", () => {
    activeCategory = b.dataset.category || "";
    loadProducts(1);
  });
});

const debouncedSearch = debounce((value) => {
  activeSearch = value.trim();
  loadProducts(1);
}, 300);

const searchInput = document.getElementById("searchInput");
if (searchInput) {
  searchInput.addEventListener("input", (e) => debouncedSearch(e.target.value));
}

const sortSelect = document.getElementById("sortSelect");
if (sortSelect) {
  sortSelect.addEventListener("change", (e) => {
    activeSort = e.target.value || "";
    loadProducts(1);
  });
}

/* --- cart / wishlist --- */
function toast(text, icon = "success") {
  if (window.Swal) {
    Swal.fire({ toast: true, position: "top-end", icon, title: text, timer: 1200, showConfirmButton: false });
  } else {
    alert(text);
  }
}

function addToCart(item) {
  if (!cart.some(p => p._id === item._id)) {
    cart.push({ ...item, quantity: 1 });
    localStorage.setItem("shopcartdata", JSON.stringify(cart));
    toast("Added to cart", "success");
  } else {
    toast("Already in cart", "info");
  }
}

function addToWishlist(item) {
  if (!wishlist.some(p => p._id === item._id)) {
    wishlist.push(item);
    localStorage.setItem("shopwishlist", JSON.stringify(wishlist));
    toast("Added to wishlist", "success");
  } else {
    toast("Already in wishlist", "info");
  }
}

/* --- small helpers --- */
function escapeHtml(unsafe) {
  return String(unsafe)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
