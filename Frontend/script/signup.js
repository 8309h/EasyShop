document.getElementById("hide").addEventListener("click", function () {
    let cont = document.getElementById("container");
    cont.style.display = "none";
});

let form = document.getElementById('signupForm');
form.addEventListener('submit', myfun);

function myfun(event) {
    event.preventDefault();

    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const address = document.getElementById("address").value;

    if (name === "" || email === "" || password === "" || address === "") {
        alert("All fields are required");
    } else {
        let payload = { name, email, password, address };
        let deployed = "https://easy-shop-backend-ckq6.onrender.com/users/register";

       

        fetch(deployed, {
            method: "POST",
            headers: {
                "Content-type": "application/json"
            },
            body: JSON.stringify(payload)
        })
        .then(res => res.json())
        .then(data => {
            console.log("data", data.msg);

            if (data.msg === "User already exists. Please login") {
                alert(data.msg);
                location.href = "login.html";
            } else if (data.msg === "New user registered successfully") {
                alert("SignUp Success");
                location.href = "login.html";
                // After successful signup
                // localStorage.setItem('hasSignedUp', true);
                // Close the modal
                document.getElementById('signupModal').style.display = 'none';
            }
        })
        .catch(err => {
            console.log(err);
        });
    }
}

function togglePasswordVisibility() {
    const passwordField = document.getElementById("password");
    const eyeIcon = document.getElementById("eye");

    if (passwordField.type === "password") {
        passwordField.type = "text";
        eyeIcon.textContent = "👁️";
    } else {
        passwordField.type = "password";
        eyeIcon.textContent = "🔒";
    }
}
