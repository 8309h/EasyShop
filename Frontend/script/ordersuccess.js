// ordersuccess.js — Load invoice & render Razorpay style invoice

const invoice = JSON.parse(localStorage.getItem("latest_invoice"));

if (!invoice) {
  document.body.innerHTML = "<h2 style='text-align:center;margin-top:40px;'>No invoice found!</h2>";
  throw new Error("Invoice missing");
}

// Invoice meta
document.getElementById("inv-id").textContent = "Invoice ID: " + invoice.id;
document.getElementById("inv-date").textContent = "Date: " + invoice.date;

// Shipping
document.getElementById("inv-shipping").innerHTML = `
  <strong>${invoice.shipping.name}</strong><br>
  ${invoice.shipping.addr1}<br>
  ${invoice.shipping.addr2 ? invoice.shipping.addr2 + "<br>" : ""}
  ${invoice.shipping.city}, ${invoice.shipping.state} - ${invoice.shipping.zip}<br>
  ${invoice.shipping.country}<br>
  Phone: ${invoice.shipping.phone}
`;

// Items
let rows = "";
invoice.items.forEach(it => {
  rows += `
    <tr>
      <td>${it.title}</td>
      <td>${it.qty}</td>
      <td>₹${it.price}</td>
      <td>₹${it.total}</td>
    </tr>
  `;
});
document.getElementById("inv-items").innerHTML = rows;

// Summary
document.getElementById("s-subtotal").textContent = "₹" + invoice.subtotal;
document.getElementById("s-discount").textContent = "-₹" + invoice.discount;
document.getElementById("s-gst").textContent = "₹" + invoice.gst;
document.getElementById("s-delivery").textContent = invoice.delivery === 0 ? "FREE" : "₹" + invoice.delivery;
document.getElementById("s-total").textContent = "₹" + invoice.total;

// PDF
document.getElementById("downloadPDF").addEventListener("click", () => {
  const el = document.querySelector(".invoice-container");
  html2pdf().from(el).save(`Invoice-${invoice.id}.pdf`);
});
