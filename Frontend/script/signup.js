import { BASE_URL } from "./config.js";

// ----------------------
// Signup Form Handler
// ----------------------
document.getElementById("signupForm").addEventListener("submit", handleSignup);

async function handleSignup(e) {
    e.preventDefault();

    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();
    const address = document.getElementById("address").value.trim();

    if (!name || !email || !password || !address) {
        return Swal.fire("Missing Fields", "All fields are required", "warning");
    }

    const payload = { name, email, password, address };

    try {
        const res = await fetch(`${BASE_URL}/api/users/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        const data = await res.json();
        console.log("Signup Response:", data);

        if (data.msg === "User already exists. Please login") {
            await Swal.fire("Already Exists", data.msg, "info");
            window.location.href = "login.html";
        }
        else if (data.msg === "New user registered successfully") {
            await Swal.fire("Success", "Signup Successful!", "success");
            window.location.href = "login.html";
        }
        else {
            Swal.fire("Error", data.msg || "Something went wrong", "error");
        }

    } catch (error) {
        console.log(error);
        Swal.fire("Error", "Server error. Try again.", "error");
    }
}

// ----------------------
// Toggle Password Visibility
// ----------------------
window.togglePasswordVisibility = function () {
    const pass = document.getElementById("password");
    const eye = document.getElementById("eye");

    if (pass.type === "password") {
        pass.type = "text";
        eye.textContent = "👁️";
    } else {
        pass.type = "password";
        eye.textContent = "🔒";
    }
};
