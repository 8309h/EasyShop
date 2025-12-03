// ===============================
// WISHLIST PAGE — FINAL VERSION
// Uses:
// cart   → shopcartdata
// wishlist → shopwishlist
// ===============================

// Load data from localStorage
let cart = JSON.parse(localStorage.getItem("shopcartdata")) || [];
let wishlist = JSON.parse(localStorage.getItem("shopwishlist")) || [];

// DOM
const wishlistContainer = document.getElementById("wishlist-container");
const cartCount = document.getElementById("cartcount");

// Update cart count in navbar
function updateCartCount() {
    cartCount.textContent = cart.length;
}

// Save changes
function saveData() {
    localStorage.setItem("shopcartdata", JSON.stringify(cart));
    localStorage.setItem("shopwishlist", JSON.stringify(wishlist));
    updateCartCount();
}

// Render Wishlist UI
function renderWishlist() {
    wishlistContainer.innerHTML = "";

    // Empty state
    if (wishlist.length === 0) {
        wishlistContainer.innerHTML = `
            <h2 style="grid-column:1/-1;text-align:center;margin-top:40px;color:#777">
                Your wishlist is empty 💔
            </h2>
        `;
        return;
    }

    // Build Cards
    wishlist.forEach((item, index) => {
        const card = document.createElement("div");
        card.className = "w-item";

        card.innerHTML = `
            <img src="${item.image}" alt="${item.title}">
            
            <div class="w-title">${item.title}</div>
            <div class="w-price">₹${item.price}</div>

            <div class="w-actions">
                <button class="btn btn-cart" data-index="${index}">
                    Add to Cart
                </button>

                <button class="btn btn-remove" data-index="${index}">
                    Remove
                </button>
            </div>
        `;

        wishlistContainer.appendChild(card);
    });

    // Add to Cart Logic
    document.querySelectorAll(".btn-cart").forEach(btn => {
        btn.addEventListener("click", (e) => {
            const idx = Number(e.target.dataset.index);
            const product = wishlist[idx];

            // Push into cart
            cart.push({
                title: product.title,
                price: product.price,
                image: product.image,
                quantity: 1
            });

            // Remove from wishlist
            wishlist.splice(idx, 1);

            saveData();
            Swal.fire("Added to Cart!", "", "success");

            renderWishlist();
        });
    });

    // Remove from Wishlist
    document.querySelectorAll(".btn-remove").forEach(btn => {
        btn.addEventListener("click", (e) => {
            const idx = Number(e.target.dataset.index);

            wishlist.splice(idx, 1);
            saveData();

            Swal.fire("Removed!", "", "info");

            renderWishlist();
        });
    });
}

// INIT
renderWishlist();
updateCartCount();
