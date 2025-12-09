"use strict";

const Thread = require("../models/Thread");
const Reply = require("../models/Reply");

exports.createReply = async (req, res) => {
  const board = req.params.board;
  const { text, delete_password, thread_id } = req.body;

  const thread = await Thread.findById(thread_id);
  if (!thread) return res.send("thread not found");

  const reply = new Reply({
    text,
    delete_password,
    reported: false,
    created_on: new Date(),
  });

  thread.replies.push(reply);
  thread.bumped_on = new Date();
  await thread.save();

  res.json(thread);
};

exports.getReplies = async (req, res) => {
  const thread_id = req.query.thread_id;

  const thread = await Thread.findById(thread_id).select(
    "-delete_password -reported -replies.delete_password",
  );

  res.json(thread);
};

exports.reportReply = async (req, res) => {
  const { thread_id, reply_id } = req.body;

  const thread = await Thread.findById(thread_id);
  if (!thread) return res.send("thread not found");

  const reply = thread.replies.id(reply_id);
  if (!reply) return res.send("reply not found");

  reply.reported = true;
  await thread.save();

  res.send("reported");
};

exports.deleteReply = async (req, res) => {
  const { thread_id, reply_id, delete_password } = req.body;

  const thread = await Thread.findById(thread_id);
  if (!thread) return res.send("thread not found");

  const reply = thread.replies.id(reply_id);
  if (!reply) return res.send("reply not found");

  if (reply.delete_password !== delete_password)
    return res.send("incorrect password");

  reply.text = "[deleted]";
  await thread.save();

  res.send("success");
};
