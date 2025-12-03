// ================================
// payment.js — FINAL VERSION
// Razorpay style + Invoice Data
// ================================

// CART
let cart = JSON.parse(localStorage.getItem("shopcartdata")) || [];

// DOM
const summaryItemsBox = document.getElementById("summaryItems");
const elSubtotal = document.getElementById("summarySubtotal");
const elDiscount = document.getElementById("summaryDiscount");
const elGst = document.getElementById("summaryGst");
const elDelivery = document.getElementById("summaryDelivery");
const elTotal = document.getElementById("summaryTotal");
const payBtn = document.getElementById("payBtn");

const couponForm = document.getElementById("couponForm");
const couponInput = document.getElementById("couponInput");
const couponMsg = document.getElementById("couponMsg");

const shipForm = document.getElementById("shippingForm");

const cardForm = document.getElementById("cardForm");
const upiForm = document.getElementById("upiForm");
const codNote = document.getElementById("codNote");

const pmethods = Array.from(document.querySelectorAll(".pmethod"));
const radios = Array.from(document.querySelectorAll('input[name="payment_method"]'));

const DELIVERY_THRESHOLD = 499;
const DELIVERY_FEE = 49;
const GST = 0.05;
const COUPONS = { "HM-DEC": 0.10, "HMDEC": 0.10 };

let selectedMethod = "card";
let currentCoupon = null;

let subtotal = 0;
let discountAmount = 0;
let gstAmount = 0;
let deliveryAmount = 0;
let totalPayable = 0;

// Swal toast fallback
function showToast(msg, icon="success") {
  if (window.Swal) {
    Swal.fire({
      title: msg,
      icon,
      timer: 1200,
      position: "center",
      showConfirmButton: false
    });
  } else {
    alert(msg);
  }
}

function persistCart() {
  localStorage.setItem("shopcartdata", JSON.stringify(cart));
}

// Recalculate Summary
function recalcSummary() {
  subtotal = cart.reduce((s, it) => s + (it.price * (it.quantity || 1)), 0);

  discountAmount = currentCoupon ? Math.floor(subtotal * COUPONS[currentCoupon]) : 0;

  const taxable = subtotal - discountAmount;

  gstAmount = Math.round(taxable * GST);
  deliveryAmount = subtotal >= DELIVERY_THRESHOLD || subtotal === 0 ? 0 : DELIVERY_FEE;

  totalPayable = taxable + gstAmount + deliveryAmount;

  elSubtotal.textContent = "₹" + subtotal;
  elDiscount.textContent = "-₹" + discountAmount;
  elGst.textContent = "₹" + gstAmount;
  elDelivery.textContent = deliveryAmount === 0 ? "FREE" : "₹" + deliveryAmount;
  elTotal.textContent = "₹" + totalPayable;

  payBtn.disabled = cart.length === 0;
}

// Render Cart Items
function renderSummaryItems() {
  summaryItemsBox.innerHTML = "";

  cart.forEach((item, idx) => {
    summaryItemsBox.innerHTML += `
      <div class="checkout-item">
        <img src="${item.image}" />
        <div class="itm-title">${item.title}</div>
        <div class="itm-qty">
          <button class="qty-btn" data-idx="${idx}" data-op="dec">−</button>
          <span>${item.quantity}</span>
          <button class="qty-btn" data-idx="${idx}" data-op="inc">+</button>
        </div>
        <div class="itm-price">₹${item.price * item.quantity}</div>
        <button class="remove-btn" data-idx="${idx}">Remove</button>
      </div>
    `;
  });

  // Qty change
  document.querySelectorAll(".qty-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const idx = btn.dataset.idx;
      const op = btn.dataset.op;

      if (op === "inc") cart[idx].quantity++;
      else {
        cart[idx].quantity--;
        if (cart[idx].quantity <= 0) cart.splice(idx, 1);
      }

      persistCart();
      recalcSummary();
      renderSummaryItems();
    });
  });

  // Remove item
  document.querySelectorAll(".remove-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      cart.splice(btn.dataset.idx, 1);
      persistCart();
      recalcSummary();
      renderSummaryItems();
    });
  });
}

// Coupon
couponForm.addEventListener("submit", e => {
  e.preventDefault();
  const code = couponInput.value.trim().toUpperCase();

  if (COUPONS[code]) {
    currentCoupon = code;
    couponMsg.textContent = `Applied: ${COUPONS[code] * 100}% Off`;
    couponMsg.style.color = "green";
    showToast("Coupon Applied");
  } else {
    currentCoupon = null;
    couponMsg.textContent = "Invalid Coupon";
    couponMsg.style.color = "red";
    showToast("Invalid Coupon", "error");
  }

  recalcSummary();
});

// Payment Method Toggle
pmethods.forEach(p => {
  p.addEventListener("click", () => {
    pmethods.forEach(x => x.classList.remove("active"));
    p.classList.add("active");

    selectedMethod = p.querySelector("input").value;

    cardForm.classList.toggle("hidden", selectedMethod !== "card");
    upiForm.classList.toggle("hidden", selectedMethod !== "upi");
    codNote.classList.toggle("hidden", selectedMethod !== "cod");
  });
});

// Luhn Check
function luhnValid(num) {
  num = num.replace(/\s+/g, "");
  if (!/^\d{12,19}$/.test(num)) return false;

  let sum = 0, alt = false;

  for (let i = num.length - 1; i >= 0; i--) {
    let n = parseInt(num[i]);
    if (alt) {
      n *= 2;
      if (n > 9) n -= 9;
    }
    sum += n;
    alt = !alt;
  }
  return sum % 10 === 0;
}

// Validate Payment
function validatePayment() {
  if (selectedMethod === "card") {
    const num = document.getElementById("card_number").value;
    const cvv = document.getElementById("card_cvv").value;

    if (!luhnValid(num)) return showToast("Invalid Card Number", "warning"), false;
    if (!/^\d{3,4}$/.test(cvv)) return showToast("Invalid CVV", "warning"), false;
  }

  if (selectedMethod === "upi") {
    const upi = document.getElementById("upi_id").value;
    if (!upi.includes("@")) return showToast("Enter valid UPI ID", "warning"), false;
  }

  return true;
}

// Final Pay
payBtn.addEventListener("click", async () => {
  if (!validatePayment()) return;

  Swal.fire({
    title: "Processing Payment...",
    didOpen: () => Swal.showLoading(),
    allowOutsideClick: false
  });

  await new Promise(res => setTimeout(res, 1200));
  Swal.close();

  // Save Invoice
  const invoice = {
    id: "INV" + Date.now(),
    date: new Date().toLocaleString(),

    shipping: {
      name: shipForm.ship_name.value,
      phone: shipForm.ship_phone.value,
      addr1: shipForm.ship_addr1.value,
      addr2: shipForm.ship_addr2.value,
      city: shipForm.ship_city.value,
      state: shipForm.ship_state.value,
      zip: shipForm.ship_zip.value,
      country: shipForm.ship_country.value,
    },

    items: cart.map(it => ({
      title: it.title,
      qty: it.quantity,
      price: it.price,
      total: it.price * it.quantity
    })),

    subtotal,
    discount: discountAmount,
    gst: gstAmount,
    delivery: deliveryAmount,
    total: totalPayable,
    method: selectedMethod
  };

  localStorage.setItem("latest_invoice", JSON.stringify(invoice));
  localStorage.removeItem("shopcartdata");

  showToast("Payment Successful");

  window.location.href = "order-success.html";
});

// Init
renderSummaryItems();
recalcSummary();
