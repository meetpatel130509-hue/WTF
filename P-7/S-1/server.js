
const express = require("express");
const session = require("express-session");
const path = require("path");

const app = express();
const PORT = 3000;

// Predefined student account for practical demonstration
const student = {
    username: "student",
    password: "12345",
    name: "Meet Patel"
};

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

app.use(session({
    secret: process.env.SESSION_SECRET || "course-portal-demo-secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        sameSite: "lax",
        secure: false,
        maxAge: 30 * 60 * 1000
    }
}));

// Middleware to protect the dashboard
function checkLogin(req, res, next) {
    if (req.session.student) {
        next();
    } else {
        res.redirect("/");
    }
}

// Home / Login page
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Handle student login
app.post("/login", (req, res) => {
    const { username, password } = req.body;

    if (
        username === student.username &&
        password === student.password
    ) {
        // Regenerate session after successful login
        req.session.regenerate((err) => {
            if (err) {
                return res.status(500).send("Unable to create session.");
            }

            req.session.student = {
                username: student.username,
                name: student.name
            };

            res.redirect("/dashboard");
        });
    } else {
        res.redirect("/?error=invalid");
    }
});

// Protected course dashboard
app.get("/dashboard", checkLogin, (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Student Dashboard</title>
            <link rel="stylesheet" href="/style.css">
        </head>
        <body>
            <header class="dashboard-header">
                <h1>Online Course Portal</h1>
                <a href="/logout" class="logout-btn">Logout</a>
            </header>

            <main class="dashboard">
                <h2>Welcome, ${escapeHTML(req.session.student.name)}!</h2>
                <p>You have successfully logged in.</p>

                <h2 class="section-title">Available Course Materials</h2>

                <div class="course-container">
                    <div class="course-card">
                        <h3>HTML and CSS</h3>
                        <p>Learn webpage structure and styling.</p>
                        <a href="#" class="course-link">View Material</a>
                    </div>

                    <div class="course-card">
                        <h3>JavaScript</h3>
                        <p>Learn programming and DOM manipulation.</p>
                        <a href="#" class="course-link">View Material</a>
                    </div>

                    <div class="course-card">
                        <h3>Node.js and Express</h3>
                        <p>Learn server-side web development.</p>
                        <a href="#" class="course-link">View Material</a>
                    </div>
                </div>
            </main>
        </body>
        </html>
    `);
});

// Escape text before inserting it into HTML
function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, (char) => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[char]);
}

// Logout and destroy session
app.get("/logout", (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).send("Unable to logout.");
        }

        res.clearCookie("connect.sid");
        res.redirect("/");
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
