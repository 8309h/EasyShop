 $(document).ready(function () {
        // Get and display the value from local storage
        let val = localStorage.getItem("disprice");
        $("#disprice").text(val);

        // Focus on the next input field when a digit is entered
        $('.otp-input').on('input', function () {
            var maxLength = parseInt($(this).attr('maxlength'));
            var currentLength = $(this).val().length;

            if (currentLength === maxLength) {
                // Move to the next input field
                $(this).next('.otp-input').focus();
            }
        });

        // Initial OTP generation and display
        let res_otp = otp();
        alert("Your OTP is " + res_otp);

        // Store OTP in localStorage for validation
        localStorage.setItem("otp", res_otp.toString());
    });

    function validateOTP() {
        var enteredOTP = $('#otp1').val() + $('#otp2').val() + $('#otp3').val() + $('#otp4').val();
        var storedOTP = localStorage.getItem("otp");

        if (enteredOTP === storedOTP) {
            alert("Payment Successful 🤩");

            // Hide the OTP form and show the receipt section
            $('#otpDiv').hide();
            $('#recipte2').show();
        } else {
            alert("Invalid OTP");
        }
    }

    function otp() {
        return Math.floor(1000 + Math.random() * 9000);
    }

    $('#resendotp').on('click', function () {
        let new_otp = otp();
        alert("Your new OTP is " + new_otp);

        localStorage.setItem("otp", new_otp.toString());
    });


var userJSON = localStorage.getItem('login_user');

var user = JSON.parse(userJSON);

var userName = user.name; 

var receipt = document.getElementById('recipte2');
var customerNameElement = document.getElementById('customerName');

if (customerNameElement && userName) {
  customerNameElement.textContent = userName;



}


var receipt = document.getElementById('recipte2');

if (receipt.style.display === 'block') {
//   document.body.style.backgroundImage = 'url("../Frontend/images/imagesfinal.jpeg")';
   document.body.style.backgroundColor = "white"
}

