
const express = require("express");
const session = require("express-session");
const path = require("path");

const app = express();
const PORT = 3000;

// Predefined employee details
const employee = {
    username: "employee",
    password: "12345",
    name: "Meet Patel",
    id: "EMP101",
    department: "Information Technology",
    designation: "Web Developer"
};

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

app.use(session({
    secret: process.env.SESSION_SECRET || "employee-portal-demo-secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        sameSite: "lax",
        secure: false,
        maxAge: 30 * 60 * 1000
    }
}));

// Middleware to check login
function checkLogin(req, res, next) {
    if (req.session.employee) {
        next();
    } else {
        res.redirect("/");
    }
}

// Helper function to escape HTML
function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, char => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[char]);
}

// Home / Login page
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Login route
app.post("/login", (req, res) => {
    const { username, password } = req.body;

    if (
        username === employee.username &&
        password === employee.password
    ) {
        req.session.regenerate((err) => {
            if (err) {
                return res.status(500).send("Session creation failed.");
            }

            req.session.employee = {
                username: employee.username,
                name: employee.name
            };

            res.redirect("/dashboard");
        });
    } else {
        res.redirect("/?error=invalid");
    }
});

// Protected dashboard route
app.get("/dashboard", checkLogin, (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Employee Dashboard</title>
            <link rel="stylesheet" href="/style.css">
        </head>
        <body>

            <header class="dashboard-header">
                <h1>Employee Attendance Portal</h1>
                <nav>
                    <a href="/dashboard">Dashboard</a>
                    <a href="/profile">Profile</a>
                    <a href="/logout" class="logout">Logout</a>
                </nav>
            </header>

            <main class="dashboard">
                <h2>Welcome, ${escapeHTML(req.session.employee.name)}!</h2>
                <p class="subtitle">Employee Dashboard</p>

                <div class="cards">
                    <div class="card">
                        <h3>Today's Attendance</h3>
                        <p class="present">Present</p>
                    </div>

                    <div class="card">
                        <h3>Employee ID</h3>
                        <p>EMP101</p>
                    </div>

                    <div class="card">
                        <h3>Department</h3>
                        <p>Information Technology</p>
                    </div>
                </div>

                <section class="attendance">
                    <h2>Attendance Summary</h2>
                    <table>
                        <tr>
                            <th>Date</th>
                            <th>Check-in</th>
                            <th>Status</th>
                        </tr>
                        <tr>
                            <td>26 November 2026</td>
                            <td>09:30 AM</td>
                            <td class="present">Present</td>
                        </tr>
                        <tr>
                            <td>25 November 2026</td>
                            <td>09:25 AM</td>
                            <td class="present">Present</td>
                        </tr>
                        <tr>
                            <td>24 November 2026</td>
                            <td>--</td>
                            <td>Leave</td>
                        </tr>
                    </table>
                </section>

                <a href="/profile" class="button">View Profile</a>
            </main>

        </body>
        </html>
    `);
});

// Protected employee profile route
app.get("/profile", checkLogin, (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Employee Profile</title>
            <link rel="stylesheet" href="/style.css">
        </head>
        <body>

            <header class="dashboard-header">
                <h1>Employee Attendance Portal</h1>
                <nav>
                    <a href="/dashboard">Dashboard</a>
                    <a href="/profile">Profile</a>
                    <a href="/logout" class="logout">Logout</a>
                </nav>
            </header>

            <main class="profile">
                <h2>Employee Profile</h2>

                <div class="profile-card">
                    <h3>${escapeHTML(employee.name)}</h3>
                    <p><strong>Employee ID:</strong> ${escapeHTML(employee.id)}</p>
                    <p><strong>Username:</strong> ${escapeHTML(employee.username)}</p>
                    <p><strong>Department:</strong> ${escapeHTML(employee.department)}</p>
                    <p><strong>Designation:</strong> ${escapeHTML(employee.designation)}</p>
                </div>

                <a href="/dashboard" class="button">Back to Dashboard</a>
            </main>

        </body>
        </html>
    `);
});

// Logout and destroy session
app.get("/logout", (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).send("Logout failed.");
        }

        res.clearCookie("connect.sid");
        res.redirect("/");
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
