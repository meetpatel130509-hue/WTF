
const loginForm = document.getElementById("loginForm");
const errorMessage = document.getElementById("errorMessage");

const params = new URLSearchParams(window.location.search);

// Display server-side login error
if (params.get("error") === "invalid") {
    errorMessage.textContent = "Invalid username or password!";
}

// Validate login form
loginForm.addEventListener("submit", function (event) {
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();

    if (username === "" || password === "") {
        event.preventDefault();
        errorMessage.textContent = "Please enter username and password.";
    }
});
