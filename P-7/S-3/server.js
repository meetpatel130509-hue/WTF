
const express = require("express");
const session = require("express-session");
const path = require("path");

const app = express();
const PORT = 3000;

// Predefined hotel guest account
const user = {
    username: "guest",
    password: "12345",
    name: "Meet Patel"
};

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

app.use(session({
    secret: process.env.SESSION_SECRET || "hotel-portal-demo-secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        sameSite: "lax",
        secure: false,
        maxAge: 30 * 60 * 1000
    }
}));

// Middleware to protect booking page
function checkLogin(req, res, next) {
    if (req.session.user) {
        next();
    } else {
        res.redirect("/");
    }
}

// Escape user input before inserting it into HTML
function escapeHTML(value = "") {
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
        username === user.username &&
        password === user.password
    ) {
        // Create a new session after successful login
        req.session.regenerate((err) => {
            if (err) {
                return res.status(500).send("Session creation failed.");
            }

            req.session.user = {
                username: user.username,
                name: user.name
            };

            res.redirect("/booking");
        });
    } else {
        res.redirect("/?error=invalid");
    }
});

// Protected hotel booking page
app.get("/booking", checkLogin, (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Hotel Reservation</title>
            <link rel="stylesheet" href="/style.css">
        </head>
        <body>

            <header class="booking-header">
                <h1>Grand Palace Hotel</h1>
                <nav>
                    <a href="/booking">Home</a>
                    <a href="/logout" class="logout">Logout</a>
                </nav>
            </header>

            <main class="booking-container">
                <h2>Welcome, ${escapeHTML(req.session.user.name)}!</h2>
                <p class="subtitle">Book your comfortable hotel stay.</p>

                <section class="booking-card">
                    <h2>Room Reservation Form</h2>

                    <form action="/reserve" method="POST">

                        <label for="guestName">Guest Name</label>
                        <input
                            type="text"
                            id="guestName"
                            name="guestName"
                            required
                        >

                        <label for="email">Email Address</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            required
                        >

                        <label for="checkin">Check-in Date</label>
                        <input
                            type="date"
                            id="checkin"
                            name="checkin"
                            required
                        >

                        <label for="checkout">Check-out Date</label>
                        <input
                            type="date"
                            id="checkout"
                            name="checkout"
                            required
                        >

                        <label for="room">Select Room</label>
                        <select id="room" name="room" required>
                            <option value="">Choose a room</option>
                            <option value="Standard">Standard Room</option>
                            <option value="Deluxe">Deluxe Room</option>
                            <option value="Suite">Luxury Suite</option>
                        </select>

                        <label for="guests">Number of Guests</label>
                        <input
                            type="number"
                            id="guests"
                            name="guests"
                            min="1"
                            max="6"
                            value="1"
                            required
                        >

                        <button type="submit">Book Now</button>
                    </form>
                </section>
            </main>

        </body>
        </html>
    `);
});

// Protected reservation submission
app.post("/reserve", checkLogin, (req, res) => {
    const { guestName, email, checkin, checkout, room, guests } = req.body;

    // Basic server-side validation
    const start = new Date(checkin);
    const end = new Date(checkout);

    if (
        !guestName.trim() ||
        !email.trim() ||
        !Number.isFinite(start.getTime()) ||
        !Number.isFinite(end.getTime()) ||
        end <= start ||
        !["Standard", "Deluxe", "Suite"].includes(room) ||
        !Number.isInteger(Number(guests)) ||
        Number(guests) < 1 ||
        Number(guests) > 6
    ) {
        return res.status(400).send("Invalid booking details. Please go back and try again.");
    }

    res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Booking Confirmation</title>
            <link rel="stylesheet" href="/style.css">
        </head>
        <body>
            <main class="confirmation">
                <h1>Booking Submitted Successfully!</h1>
                <p>Thank you, ${escapeHTML(guestName)}.</p>
                <p>Email: ${escapeHTML(email)}</p>
                <p>Check-in: ${escapeHTML(checkin)}</p>
                <p>Check-out: ${escapeHTML(checkout)}</p>
                <p>Room: ${escapeHTML(room)}</p>
                <p>Number of Guests: ${escapeHTML(guests)}</p>
                <p>Your demonstration reservation has been submitted.</p>

                <a href="/booking" class="button">Back to Booking</a>
                <a href="/logout" class="button logout">Logout</a>
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
