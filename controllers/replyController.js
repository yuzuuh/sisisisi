// controllers/replyController.js
const mongoose = require("mongoose");
const Thread = require("../models/Thread");

exports.createReply = async (req, res) => {
  const { board } = req.params;
  const { text, delete_password, thread_id } = req.body;

  const thread = await Thread.findById(thread_id);
  if (!thread) return res.send("thread not found");

  const reply = {
    _id: new mongoose.Types.ObjectId(),
    text,
    delete_password,
    created_on: new Date(),
    reported: false,
  };

  thread.replies.push(reply);
  thread.bumped_on = new Date();
  await thread.save();

  res.json(thread);
};

exports.getReplies = async (req, res) => {
  const { thread_id } = req.query;

  const thread = await Thread.findById(thread_id).lean();
  if (!thread) return res.send("not found");

  const replies = thread.replies.map((r) => ({
    _id: r._id,
    text: r.text,
    created_on: r.created_on,
  }));

  res.json({
    _id: thread._id,
    text: thread.text,
    created_on: thread.created_on,
    bumped_on: thread.bumped_on,
    replies,
  });
};

exports.reportReply = async (req, res) => {
  const { thread_id, reply_id } = req.body;

  const thread = await Thread.findById(thread_id);
  if (!thread) return res.send("not found");

  const reply = thread.replies.id(reply_id);
  if (!reply) return res.send("not found");

  reply.reported = true;
  await thread.save();

  res.send("reported");
};

exports.deleteReply = async (req, res) => {
  const { thread_id, reply_id, delete_password } = req.body;

  const thread = await Thread.findById(thread_id);
  if (!thread) return res.send("incorrect password");

  const reply = thread.replies.id(reply_id);
  if (!reply) return res.send("incorrect password");

  if (reply.delete_password !== delete_password)
    return res.send("incorrect password");

  reply.text = "[deleted]";
  await thread.save();

  res.send("success");
};
