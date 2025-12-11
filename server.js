const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const helmet = require("helmet");
require("dotenv").config();

const app = express();

// Basic configuration
const port = process.env.PORT || 5000;

// Enable CORS for all routes
app.use(cors());

// Serve static files from /public
app.use('/public', express.static("public"));

// Parse URL-encoded bodies (as sent by HTML forms)
app.use(express.urlencoded({ extended: true }));

// Parse JSON bodies (as sent by API clients)
app.use(express.json());

// Optional: align mongoose query strictness
try { mongoose.set('strictQuery', false); } catch (e) {}

// Connect to MongoDB (only if DB is configured)
if (process.env.DB) {
  mongoose
    .connect(process.env.DB)
    .then(() => console.log("Connected to MongoDB"))
    .catch((err) => console.error("MongoDB connection error:", err));
} else {
  console.warn("DB env var not set; skipping MongoDB connection");
}

// Security Middleware with Helmet
app.use(helmet.hidePoweredBy());
app.use(helmet.noSniff());
app.use(helmet.frameguard({ action: "sameorigin" }));
app.use(helmet.dnsPrefetchControl({ allow: false }));
app.use(helmet.referrerPolicy({ policy: "same-origin" }));

// Index page (render /views/index.html)
app.get("/", function (req, res) {
  res.sendFile(process.cwd() + "/views/index.html");
});

// Import and execute routing functions
require("./routes/api.js")(app);
require("./routes/fcctesting.js")(app);

// Board pages
app.route('/b/:board/')
  .get(function (req, res) {
    res.sendFile(process.cwd() + '/views/board.html');
  });
app.route('/b/:board/:threadid')
  .get(function (req, res) {
    res.sendFile(process.cwd() + '/views/thread.html');
  });

// Health check endpoint for Render (does not require DB)
app.get('/health', function (req, res) { res.send('ok'); });

// Always start the server — required by FCC tests
app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});

// Export the app for testing purposes
module.exports = app;
