const mongoose = require("mongoose");

const replySchema = new mongoose.Schema({
  text: { type: String, required: true },
  delete_password: { type: String, required: true },
  reported: { type: Boolean, default: false },
  created_on: { type: Date, default: Date.now }
});

module.exports = replySchema;
