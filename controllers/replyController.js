"use strict";

const mongoose = require("mongoose");
const Thread = require("../models/Thread");

// ---------------------------------------------
// CREATE REPLY (POST /api/replies/:board)
// ---------------------------------------------
exports.createReply = async (req, res) => {
  const { board } = req.params;
  const { text, delete_password, thread_id } = req.body;

  try {
    const thread = await Thread.findById(thread_id);
    if (!thread) return res.send("thread not found");

    // Generate reply object exactly as FCC expects
    const reply = {
      _id: new mongoose.Types.ObjectId(),
      text,
      delete_password,
      created_on: new Date(),
      reported: false,
    };

    // Add reply and bump thread
    thread.replies.push(reply);
    thread.bumped_on = reply.created_on;

    await thread.save();

    // ⭐ MUST USE redirect (FCC REQUIREMENT)
    res.redirect(`/b/${board}/${thread_id}`);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error creating reply");
  }
};

// ---------------------------------------------
// GET REPLIES (GET /api/replies/:board)
// ---------------------------------------------
exports.getReplies = async (req, res) => {
  const { thread_id } = req.query;

  try {
    const thread = await Thread.findById(thread_id).lean();
    if (!thread) return res.send("thread not found");

    // Remove sensitive fields
    const { delete_password, reported, ...safeThread } = thread;

    const safeReplies = thread.replies.map((r) => {
      const { delete_password, reported, ...clean } = r;
      return clean;
    });

    res.json({ ...safeThread, replies: safeReplies });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error retrieving replies");
  }
};

// ---------------------------------------------
// REPORT REPLY (PUT /api/replies/:board)
// ---------------------------------------------
exports.reportReply = async (req, res) => {
  const { thread_id, reply_id } = req.body;

  try {
    const thread = await Thread.findById(thread_id);
    if (!thread) return res.send("thread not found");

    const reply = thread.replies.id(reply_id);
    if (!reply) return res.send("reply not found");

    reply.reported = true;
    await thread.save();

    res.send("reported");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error reporting reply");
  }
};

// ---------------------------------------------
// DELETE REPLY (DELETE /api/replies/:board)
// ---------------------------------------------
exports.deleteReply = async (req, res) => {
  const { thread_id, reply_id, delete_password } = req.body;

  try {
    const thread = await Thread.findById(thread_id);
    if (!thread) return res.send("thread not found");

    const reply = thread.replies.id(reply_id);
    if (!reply) return res.send("reply not found");

    if (reply.delete_password !== delete_password) {
      return res.send("incorrect password");
    }

    // FCC requires replacing text with "[deleted]"
    reply.text = "[deleted]";
    await thread.save();

    res.send("success");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error deleting reply");
  }
};
