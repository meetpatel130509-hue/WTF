
const express = require("express");
const session = require("express-session");
const path = require("path");

const app = express();
const PORT = 3000;

// Predefined user credentials
const USER = {
    username: "student",
    password: "12345"
};

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

app.use(session({
    secret: "library-secret-key",
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        sameSite: "lax"
    }
}));

// Authentication middleware
function checkLogin(req, res, next) {
    if (req.session.user) {
        next();
    } else {
        res.redirect("/login");
    }
}

// HOME ROUTE
app.get("/", (req, res) => {
    res.send(`
        <h1>Central City Library</h1>
        <p>Welcome to our online library portal.</p>
        <a href="/about">About</a> |
        <a href="/login">Login</a>
    `);
});

// ABOUT ROUTE
app.get("/about", (req, res) => {
    res.send(`
        <h1>About Our Library</h1>
        <p>Central City Library provides books and
        learning resources to students and staff.</p>
        <a href="/">Home</a>
    `);
});

// LOGIN PAGE
app.get("/login", (req, res) => {
    if (req.session.user) {
        return res.redirect("/dashboard");
    }

    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Library Login</title>
            <link rel="stylesheet" href="/style.css">
        </head>
        <body>
            <div class="login-box">
                <h1>Library Login</h1>
                <form action="/login" method="POST">
                    <input type="text"
                        name="username"
                        placeholder="Enter Username"
                        required>

                    <input type="password"
                        name="password"
                        placeholder="Enter Password"
                        required>

                    <button type="submit">Login</button>
                </form>
                <a href="/">Back to Home</a>
            </div>
        </body>
        </html>
    `);
});

// LOGIN PROCESS
app.post("/login", (req, res) => {
    const { username, password } = req.body;

    if (
        username === USER.username &&
        password === USER.password
    ) {
        req.session.user = username;
        return res.redirect("/dashboard");
    }

    res.send(`
        <h2>Invalid username or password!</h2>
        <a href="/login">Try Again</a>
    `);
});

// PROTECTED DASHBOARD
app.get("/dashboard", checkLogin, (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Library Dashboard</title>
            <link rel="stylesheet" href="/style.css">
        </head>
        <body>
            <div class="dashboard">
                <h1>Welcome, ${req.session.user}!</h1>
                <h2>Central City Library Dashboard</h2>
                <p>You are successfully logged in.</p>

                <h3>Available Library Resources</h3>
                <ul>
                    <li>Digital Books</li>
                    <li>Study Materials</li>
                    <li>Research Papers</li>
                    <li>Online Journals</li>
                </ul>

                <a href="/about">About Library</a>
                <br><br>
                <a href="/logout" class="logout">
                    Logout
                </a>
            </div>
        </body>
        </html>
    `);
});

// LOGOUT ROUTE
app.get("/logout", (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).send("Unable to logout.");
        }

        res.clearCookie("connect.sid");
        res.redirect("/");
    });
});

// START SERVER
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
