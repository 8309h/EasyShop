// ================================
// ordersuccess.js — FINAL VERSION
// ================================

const invoice = JSON.parse(localStorage.getItem("latest_invoice"));

if (!invoice) {
  document.body.innerHTML = "<h2 style='text-align:center;'>Invoice not found!</h2>";
  throw new Error("No invoice");
}

// Header
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
document.getElementById("inv-items").innerHTML =
  invoice.items
    .map(it => `
      <tr>
        <td>${it.title}</td>
        <td>${it.qty}</td>
        <td>₹${it.price}</td>
        <td>₹${it.total}</td>
      </tr>
    `)
    .join("");

// Summary
document.getElementById("s-subtotal").textContent = "₹" + invoice.subtotal;
document.getElementById("s-discount").textContent = "-₹" + invoice.discount;
document.getElementById("s-gst").textContent = "₹" + invoice.gst;
document.getElementById("s-delivery").textContent =
  invoice.delivery === 0 ? "FREE" : "₹" + invoice.delivery;
document.getElementById("s-total").textContent = "₹" + invoice.total;

// PDF
document.getElementById("downloadPDF").addEventListener("click", async () => {
  await import("https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js");
  const element = document.querySelector(".invoice-container");
  html2pdf().from(element).save(`Invoice-${invoice.id}.pdf`);
});
