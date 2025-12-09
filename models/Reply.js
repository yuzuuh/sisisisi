// models/Reply.js
const mongoose = require("mongoose");

const replySchema = new mongoose.Schema({
  text: String,
  delete_password: String,
  created_on: Date,
  reported: { type: Boolean, default: false },
});

module.exports = replySchema;
