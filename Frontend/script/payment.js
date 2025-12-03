// payment.js — Corrected & Robust
// Handles shipping, payment method UI, validation, coupon, totals, invoice save

// read cart (support both shapes)
let cart = JSON.parse(localStorage.getItem("shopcartdata")) || [];

// Safe DOM refs (some may be missing — handle gracefully)
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

const pmethodsContainer = document.getElementById("paymentMethods");
const pmethods = pmethodsContainer ? Array.from(pmethodsContainer.querySelectorAll(".pmethod")) : [];
const highlightEl = document.getElementById("pmethod-highlight");

// Config
const DELIVERY_THRESHOLD = 499;
const DELIVERY_FEE = 49;
const GST_RATE = 0.05;
const VALID_COUPONS = { "HM-DEC": 0.10, "HMDEC": 0.10 };

let selectedMethod = "card";
let currentCoupon = null;

let subtotal = 0;
let discountAmount = 0;
let gstAmount = 0;
let deliveryAmount = 0;
let totalPayable = 0;

// Toast helper
function showToast(title = "", icon = "success", timeout = 1200) {
  if (window.Swal && typeof Swal.fire === "function") {
    return Swal.fire({ title, icon, timer: timeout, showConfirmButton: false, position: "center" });
  } else {
    alert(title);
  }
}

// persist cart helper
function persistCart() {
  localStorage.setItem("shopcartdata", JSON.stringify(cart));
}

// compute totals (uses currentCoupon)
function recalcSummary() {
  subtotal = cart.reduce((s, it) => {
    const price = Number(it.price ?? it.Price ?? 0);
    const qty = Number(it.quantity ?? it.qty ?? 1);
    return s + price * qty;
  }, 0);

  discountAmount = currentCoupon && VALID_COUPONS[currentCoupon] ? Math.floor(subtotal * VALID_COUPONS[currentCoupon]) : 0;
  const taxable = Math.max(0, subtotal - discountAmount);
  gstAmount = Math.round(taxable * GST_RATE);
  deliveryAmount = (subtotal >= DELIVERY_THRESHOLD || subtotal === 0) ? 0 : DELIVERY_FEE;
  totalPayable = Math.max(0, taxable + gstAmount + deliveryAmount);

  if (elSubtotal) elSubtotal.textContent = `₹${subtotal}`;
  if (elDiscount) elDiscount.textContent = `-₹${discountAmount}`;
  if (elGst) elGst.textContent = `₹${gstAmount}`;
  if (elDelivery) elDelivery.textContent = deliveryAmount === 0 ? "FREE" : `₹${deliveryAmount}`;
  if (elTotal) elTotal.textContent = `₹${totalPayable}`;

  if (payBtn) payBtn.disabled = cart.length === 0;
}

// render summary items area
function renderSummaryItems() {
  if (!summaryItemsBox) return;
  summaryItemsBox.innerHTML = "";

  if (!cart.length) {
    summaryItemsBox.innerHTML = `<div class="small-muted">Your cart is empty.</div>`;
    return;
  }

  cart.forEach((it, idx) => {
    const title = it.title ?? it.Title ?? "Product";
    const price = Number(it.price ?? it.Price ?? 0);
    const qty = Number(it.quantity ?? it.qty ?? 1);
    const img = it.image ?? it.Image ?? "./images/noimage.png";

    const itemEl = document.createElement("div");
    itemEl.className = "checkout-item";
    itemEl.innerHTML = `
      <img src="${img}" alt="${title}" />
      <div class="itm-meta">
        <div class="itm-title">${title}</div>
        <div class="small-muted">₹${price} each</div>
      </div>
      <div class="itm-controls">
        <div class="itm-qty">
          <button class="qty-btn" data-idx="${idx}" data-op="dec">−</button>
          <span class="qty-value">${qty}</span>
          <button class="qty-btn" data-idx="${idx}" data-op="inc">+</button>
        </div>
        <div class="itm-price">₹${price * qty}</div>
        <button class="remove-btn" data-idx="${idx}">Remove</button>
      </div>
    `;
    summaryItemsBox.appendChild(itemEl);
  });

  // attach handlers
  Array.from(summaryItemsBox.querySelectorAll(".qty-btn")).forEach(btn => {
    btn.addEventListener("click", () => {
      const idx = Number(btn.dataset.idx);
      const op = btn.dataset.op;
      if (!cart[idx]) return;
      if (!cart[idx].quantity) cart[idx].quantity = Number(cart[idx].qty ?? 1);
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

  Array.from(summaryItemsBox.querySelectorAll(".remove-btn")).forEach(btn => {
    btn.addEventListener("click", () => {
      const idx = Number(btn.dataset.idx);
      if (cart[idx]) cart.splice(idx, 1);
      persistCart();
      recalcSummary();
      renderSummaryItems();
      showToast("Item removed", "info");
    });
  });
}

// coupon handling (safe)
if (couponForm) {
  couponForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const code = (couponInput?.value || "").trim().toUpperCase();
    if (!code) {
      if (couponMsg) { couponMsg.textContent = "Enter coupon"; couponMsg.style.color = "red"; }
      return;
    }
    if (VALID_COUPONS[code]) {
      currentCoupon = code;
      if (couponMsg) { couponMsg.textContent = `Coupon applied: ${Math.round(VALID_COUPONS[code] * 100)}% off`; couponMsg.style.color = "green"; }
      showToast("Coupon applied", "success");
    } else {
      currentCoupon = null;
      if (couponMsg) { couponMsg.textContent = "Invalid coupon"; couponMsg.style.color = "red"; }
      showToast("Invalid coupon", "error");
    }
    recalcSummary();
    renderSummaryItems();
  });
}

// payment method UI (uses data-method)
function initPaymentUI() {
  if (!pmethods.length) return;

  // place highlight initially after paint
  setTimeout(() => moveHighlightTo(document.querySelector(".pmethod.active") ?? pmethods[0]), 20);

  pmethods.forEach(el => {
    el.addEventListener("click", () => {
      pmethods.forEach(x => x.classList.remove("active"));
      el.classList.add("active");

      selectedMethod = el.dataset.method || "card";

      // show/hide panels
      if (cardForm) cardForm.classList.toggle("hidden", selectedMethod !== "card");
      if (upiForm) upiForm.classList.toggle("hidden", selectedMethod !== "upi");
      if (codNote) codNote.classList.toggle("hidden", selectedMethod !== "cod");

      moveHighlightTo(el);
    });

    // allow keyboard select (accessibility)
    el.addEventListener("keydown", (ev) => {
      if (ev.key === "Enter" || ev.key === " ") { ev.preventDefault(); el.click(); }
    });
  });
}

function moveHighlightTo(el) {
  if (!highlightEl || !el || !highlightEl.parentElement) return;
  const parentRect = el.parentElement.getBoundingClientRect();
  const r = el.getBoundingClientRect();
  const left = r.left - parentRect.left;
  highlightEl.style.transform = `translateX(${left}px)`;
  highlightEl.style.width = `${r.width}px`;
  highlightEl.style.opacity = "1";
}

// Luhn check for card numbers
function luhnValid(number) {
  const s = (number || "").replace(/\s+/g, "");
  if (!/^\d{12,19}$/.test(s)) return false;
  let sum = 0, alt = false;
  for (let i = s.length - 1; i >= 0; i--) {
    let n = parseInt(s.charAt(i), 10);
    if (alt) { n *= 2; if (n > 9) n -= 9; }
    sum += n;
    alt = !alt;
  }
  return sum % 10 === 0;
}

// validate shipping & payment inputs
function validateBeforePay() {
  // shipping form required fields
  if (!shipForm) { showToast("Shipping form missing", "error"); return false; }
  const name = shipForm.ship_name?.value?.trim();
  const phone = shipForm.ship_phone?.value?.trim();
  const addr1 = shipForm.ship_addr1?.value?.trim();
  const city = shipForm.ship_city?.value?.trim();
  const zip = shipForm.ship_zip?.value?.trim();
  const state = shipForm.ship_state?.value?.trim();
  const country = shipForm.ship_country?.value?.trim();

  if (!name || !phone || !addr1 || !city || !zip || !state || !country) {
    showToast("Please complete shipping details", "warning");
    return false;
  }

  // payment-specific
  if (selectedMethod === "card") {
    const num = document.getElementById("card_number")?.value?.trim() || "";
    const cvv = document.getElementById("card_cvv")?.value?.trim() || "";
    if (!num || !cvv) { showToast("Enter card details", "warning"); return false; }
    if (!luhnValid(num)) { showToast("Invalid card number", "warning"); return false; }
    if (!/^\d{3,4}$/.test(cvv)) { showToast("Invalid CVV", "warning"); return false; }
  }

  if (selectedMethod === "upi") {
    const upi = document.getElementById("upi_id")?.value?.trim() || "";
    if (!upi || !upi.includes("@")) { showToast("Enter valid UPI ID", "warning"); return false; }
  }

  return true;
}

// finalize payment (simulate)
if (payBtn) {
  payBtn.addEventListener("click", async (e) => {
    e.preventDefault();

    if (!cart || !cart.length) { showToast("Cart is empty", "info"); return; }
    if (!validateBeforePay()) return;

    // show spinner
    if (window.Swal) {
      Swal.fire({ title: "Processing payment...", allowOutsideClick: false, didOpen: () => Swal.showLoading() });
    }

    await new Promise(r => setTimeout(r, 1000));

    if (window.Swal) Swal.close();

    // recompute final totals
    recalcSummary();

    // build invoice
    const invoice = {
      id: "INV" + Date.now(),
      date: new Date().toLocaleString(),
      shipping: {
        name: shipForm.ship_name.value,
        phone: shipForm.ship_phone.value,
        addr1: shipForm.ship_addr1.value,
        addr2: shipForm.ship_addr2?.value || "",
        city: shipForm.ship_city.value,
        state: shipForm.ship_state.value,
        zip: shipForm.ship_zip.value,
        country: shipForm.ship_country.value
      },
      items: cart.map(it => ({
        title: it.title ?? it.Title ?? "Product",
        qty: Number(it.quantity ?? it.qty ?? 1),
        price: Number(it.price ?? it.Price ?? 0),
        total: Number(it.quantity ?? it.qty ?? 1) * Number(it.price ?? it.Price ?? 0)
      })),
      subtotal,
      discount: discountAmount,
      gst: gstAmount,
      delivery: deliveryAmount,
      total: totalPayable,
      method: selectedMethod
    };

    localStorage.setItem("latest_invoice", JSON.stringify(invoice));

    // clear cart
    localStorage.removeItem("shopcartdata");
    cart = [];

    showToast("Payment successful", "success");

    // small delay so user sees the toast
    setTimeout(() => window.location.href = "order-success.html", 900);
  });
}

// initialize UI and compute totals
init();

function init() {
  // pick default method (first element or 'card')
  if (pmethods.length) {
    const active = pmethods.find(p => p.classList.contains("active")) || pmethods[0];
    selectedMethod = active?.dataset?.method || "card";
    // show/hide panels
    if (cardForm) cardForm.classList.toggle("hidden", selectedMethod !== "card");
    if (upiForm) upiForm.classList.toggle("hidden", selectedMethod !== "upi");
    if (codNote) codNote.classList.toggle("hidden", selectedMethod !== "cod");
  }
  initPaymentUI();
  recalcSummary();
  renderSummaryItems();
}
