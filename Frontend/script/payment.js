document.addEventListener("DOMContentLoaded", function () {
  let paymentForm = document.getElementById("paymentForm");
  paymentForm.addEventListener("submit", function (event) {
      event.preventDefault();
      if (validateForm()) {
          let name = document.querySelector('#name').value;
          let cardNo = document.querySelector('#cardNo').value;
          let cvv = document.querySelector('#cardCvv').value;

          let obj = {
              name, cardNo, cvv
          };
          localStorage.setItem("shopbagpaymentinfo", JSON.stringify(obj));

          if (obj.name == "" || obj.cardNo == "" || obj.cvv == "") {
              alert("Any of the given fields are empty");
          } else {
              window.location = "./otp.html";
          }
      }
  });

  function validateForm() {
      // Get the values from the form
      var cardNumber = document.getElementById("cardNo");
      var cvvNumber = document.getElementById("cardCvv");

      // Truncate input values if they exceed the expected length
      cardNumber.value = cardNumber.value.slice(0, 16);
      cvvNumber.value = cvvNumber.value.slice(0, 3);

      // Check card number length
      if (cardNumber.value.length !== 16) {
          alert("Card number must be exactly 16 digits long.");
          return false;
      }

      // Check CVV number length
      if (cvvNumber.value.length !== 3) {
          alert("CVV number must be exactly 3 digits long.");
          return false;
      }

      // If all validations pass, you can submit the form
      return true;
  }
});