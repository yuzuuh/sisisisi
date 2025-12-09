// models/Thread.js
const mongoose = require("mongoose");
const replySchema = require("./Reply");

const threadSchema = new mongoose.Schema({
  board: String,
  text: String,
  delete_password: String,
  created_on: Date,
  bumped_on: Date,
  reported: { type: Boolean, default: false },
  replies: [replySchema],
});

module.exports = mongoose.model("Thread", threadSchema);
