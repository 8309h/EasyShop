let cart = JSON.parse(localStorage.getItem("shopcartdata")) || [];
let OfferApplied = false;

// DOM References
const cartContainer = document.getElementById("cart-container");
const subtotalEl = document.getElementById("summary-subtotal");
const discountEl = document.getElementById("summary-discount");
const taxEl = document.getElementById("summary-tax");
const totalEl = document.getElementById("cart-total");
const couponForm = document.getElementById("coupon-form");
const couponInput = document.getElementById("cupon-filled");
const buyNowButton = document.getElementById("buyNowButton");
const cartCount = document.getElementById("cartcount");

initCart();

// ======================================================
// LOAD CART
// ======================================================
function initCart() {
    renderCartItems(cart);
    updateSummary();
}

// ======================================================
// RENDER CART ITEMS
// ======================================================
function renderCartItems(items) {
    cartContainer.innerHTML = "";

    if (items.length === 0) {
        cartContainer.innerHTML = `
            <div class="empty-cart">
                <h3>Your cart is empty</h3>
                <p>Add some products to continue</p>
            </div>`;
        return;
    }

    cartCount.textContent = items.length;

    items.forEach((item, index) => {
        const div = document.createElement("div");
        div.className = "cart-item";

        div.innerHTML = `
            <img src="${item.image || item.Image}" alt="${item.title}" />

            <div class="cart-info">
                <h3>${item.title || item.Title}</h3>
                <p>${item.description || item.Description}</p>
                <p class="cart-price">₹${item.price || item.Price}</p>

                <div class="qty-box">
                    <button class="qty-btn" data-action="inc">+</button>
                    <span class="qty-value">${item.quantity || 1}</span>
                    <button class="qty-btn" data-action="dec">-</button>
                </div>

                <button class="remove-btn">Remove</button>
            </div>
        `;

        // Quantity +/-
        const qtyBtns = div.querySelectorAll(".qty-btn");
        qtyBtns[0].addEventListener("click", () => updateQty(index, "inc"));
        qtyBtns[1].addEventListener("click", () => updateQty(index, "dec"));

        // Remove
        div.querySelector(".remove-btn").addEventListener("click", () => {
            removeItem(index);
        });

        cartContainer.appendChild(div);
    });
}

// ======================================================
// UPDATE QUANTITY
// ======================================================
function updateQty(index, type) {
    if (type === "inc") {
        cart[index].quantity++;
    } else if (type === "dec" && cart[index].quantity > 1) {
        cart[index].quantity--;
    }

    saveCart();
    initCart();
}

// ======================================================
// REMOVE ITEM
// ======================================================
function removeItem(index) {
    cart.splice(index, 1);
    saveCart();
    initCart();

    Swal.fire({
        icon: "success",
        title: "Item removed",
        timer: 1200,
        showConfirmButton: false,
    });
}

// ======================================================
// UPDATE SUMMARY (Subtotal → Discount → Tax → Total)
// ======================================================
function updateSummary() {
    let subtotal = cart.reduce(
        (sum, item) => sum + (item.price || item.Price) * (item.quantity || 1),
        0
    );

    let discount = OfferApplied ? subtotal * 0.10 : 0;
    let taxable = subtotal - discount;
    let tax = taxable * 0.05;
    let total = taxable + tax;

    subtotalEl.textContent = `₹${subtotal.toFixed(2)}`;
    discountEl.textContent = `₹${discount.toFixed(2)}`;
    taxEl.textContent = `₹${tax.toFixed(2)}`;
    totalEl.textContent = total.toFixed(2);
}

// ======================================================
// APPLY COUPON
// ======================================================
couponForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const code = couponInput.value.trim();

    if (code === "HM-dec") {
        OfferApplied = true;
        updateSummary();

        Swal.fire({
            icon: "success",
            title: "Coupon Applied",
            text: "You received 10% OFF!",
            timer: 1500,
            showConfirmButton: false
        });
    } else {
        Swal.fire({
            icon: "error",
            title: "Invalid Coupon",
            timer: 1500,
            showConfirmButton: false
        });
    }
});

// ======================================================
// PROCEED TO PAYMENT
// ======================================================
buyNowButton.addEventListener("click", () => {
    if (cart.length === 0) {
        Swal.fire({
            icon: "warning",
            title: "Your cart is empty",
            timer: 1500,
            showConfirmButton: false
        });
        return;
    }

    Swal.fire({
        icon: "success",
        title: "Proceeding to Payment",
        timer: 1500,
        showConfirmButton: false
    });

    setTimeout(() => {
        window.location.href = "payment.html";
    }, 1500);
});

// ======================================================
// SAVE CART
// ======================================================
function saveCart() {
    localStorage.setItem("shopcartdata", JSON.stringify(cart));
}
