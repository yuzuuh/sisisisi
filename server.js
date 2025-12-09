const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();

// Basic configuration
const port = process.env.PORT || 3000;

// Enable CORS for all routes
app.use(cors());

// Serve static files from /public
app.use(express.static("public"));

// Parse URL-encoded bodies (as sent by HTML forms)
app.use(express.urlencoded({ extended: true }));

// Parse JSON bodies (as sent by API clients)
app.use(express.json());

// Connect to MongoDB (Mongoose 7/8 syntax)
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Index page (render /views/index.html)
app.get("/", function (req, res) {
  res.sendFile(process.cwd() + "/views/index.html");
});

// Import and execute routing functions
require("./routes/api.js")(app);
require("./routes/fcctesting.js")(app);

// Start listening for requests
app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});

// Export the app for testing purposes
module.exports = app;
