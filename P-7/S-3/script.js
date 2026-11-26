
const loginForm = document.getElementById("loginForm");
const errorMessage = document.getElementById("errorMessage");

// Read error message from the URL
const params = new URLSearchParams(window.location.search);

if (params.get("error") === "invalid") {
    errorMessage.textContent = "Invalid username or password!";
}

// Login form validation
loginForm.addEventListener("submit", function(event) {

    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();

    if (username === "" || password === "") {
        event.preventDefault();
        errorMessage.textContent = "Please enter username and password.";
    }

});
