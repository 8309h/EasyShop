// ================================
// products.js — FINAL FIXED VERSION
// ================================

// BASE_URL coming from window (defined in HTML)
const BASE_URL = window.BASE_URL;

// Load cart & wishlist
let cart = JSON.parse(localStorage.getItem("shopcartdata")) || [];
let wishlist = JSON.parse(localStorage.getItem("shopwishlist")) || [];

let currentPage = 1;
let limit = 12;
let activeCategory = "";
let activeSearch = "";
let activeSort = "";

// Update counters
function updateCounts() {
  const c = document.getElementById("cartcount");
  const w = document.getElementById("wishcount");

  if (c) c.textContent = cart.length;
  if (w) w.textContent = wishlist.length;
}

updateCounts();

// Debounce
function debounce(fn, delay = 300) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), delay);
  };
}


// =========================================
// LOAD PRODUCTS — FIXED URL BUILDER
// =========================================
async function loadProducts(page = 1) {
  currentPage = page;

  try {
    const url = new URL(BASE_URL + "/api/products");

    url.searchParams.set("page", currentPage);
    url.searchParams.set("limit", limit);

    if (activeCategory) url.searchParams.set("category", activeCategory);
    if (activeSearch) url.searchParams.set("search", activeSearch);

    switch (activeSort) {
      case "LTH":
        url.searchParams.set("sort", "price");
        url.searchParams.set("order", "asc");
        break;
      case "HTL":
        url.searchParams.set("sort", "price");
        url.searchParams.set("order", "desc");
        break;
      case "A-Z":
        url.searchParams.set("sort", "title");
        url.searchParams.set("order", "asc");
        break;
      case "Z-A":
        url.searchParams.set("sort", "title");
        url.searchParams.set("order", "desc");
        break;
    }

    console.log("FETCH →", url.toString());

    const res = await fetch(url.toString());
    const result = await res.json();

    displayProducts(result.data || []);
    renderPagination(result.totalPages || 1, result.page || 1);

  } catch (err) {
    console.error("Fetch error:", err);
    displayProducts([]);
    renderPagination(1, 1);
  }
}

loadProducts();


// =========================================
// DISPLAY PRODUCTS
// =========================================
function displayProducts(list) {
  const container = document.getElementById("products-container");
  container.innerHTML = "";

  if (!list.length) {
    container.innerHTML = "<h2>No products found</h2>";
    return;
  }

  list.forEach(item => {
    const card = document.createElement("div");
    card.className = "product-card";

    const img = (item.image && item.image.startsWith("http")) ? item.image : "./images/noimage.png";

    card.innerHTML = `
      <img src="${img}" />
      <h3>${escapeHtml(item.title)}</h3>
      <p class="desc">${escapeHtml(item.description).slice(0, 80)}...</p>
      <p class="price">₹ ${item.price}</p>

      <div class="actions">
        <button class="btn-cart">Add to Cart</button>
        <button class="btn-wish">Wishlist</button>
      </div>
    `;

    // Add cart
    card.querySelector(".btn-cart").addEventListener("click", () => addToCart(item));

    // Add wishlist
    card.querySelector(".btn-wish").addEventListener("click", () => addToWishlist(item));

    container.appendChild(card);
  });
}


// =========================================
// PAGINATION
// =========================================
function renderPagination(totalPages, current) {
  const pag = document.getElementById("pagination");
  pag.innerHTML = "";

  if (totalPages <= 1) return;

  if (current > 1) pag.appendChild(makeBtn("Prev", current - 1));

  for (let i = 1; i <= totalPages; i++) {
    const btn = makeBtn(i, i);
    if (i === current) btn.classList.add("active");
    pag.appendChild(btn);
  }

  if (current < totalPages) pag.appendChild(makeBtn("Next", current + 1));
}

function makeBtn(text, page) {
  const btn = document.createElement("button");
  btn.textContent = text;
  btn.className = "page-btn";
  btn.onclick = () => loadProducts(page);
  return btn;
}


// =========================================
// SEARCH (LIVE) — FIXED
// =========================================
const debouncedSearch = debounce((value) => {
  activeSearch = value.trim();
  loadProducts(1);
}, 300);

document.getElementById("searchInput").addEventListener("input", (e) => {
  debouncedSearch(e.target.value);
});


// =========================================
// SORT
// =========================================
document.getElementById("sortSelect").addEventListener("change", (e) => {
  activeSort = e.target.value;
  loadProducts(1);
});


// =========================================
// CATEGORY FILTER
// =========================================
document.querySelectorAll(".filter-btn").forEach(btn => {
  btn.onclick = () => {
    activeCategory = btn.dataset.category;
    loadProducts(1);
  };
});


// =========================================
// CART + WISHLIST
// =========================================
function toast(msg, icon = "success") {
  if (window.Swal) Swal.fire({ toast: true, icon, position: "top-end", title: msg, timer: 1200, showConfirmButton: false });
}

function addToCart(item) {
  if (cart.some(p => p._id === item._id)) return toast("Already in cart", "info");

  cart.push({ ...item, quantity: 1 });
  localStorage.setItem("shopcartdata", JSON.stringify(cart));

  updateCounts();
  toast("Added to cart");
}

function addToWishlist(item) {
  if (wishlist.some(p => p._id === item._id)) return toast("Already in wishlist", "info");

  wishlist.push(item);
  localStorage.setItem("shopwishlist", JSON.stringify(wishlist));

  updateCounts();
  toast("Added to wishlist");
}

function escapeHtml(text) {
  return text?.replace(/[&<>"]/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c])
  );
}
