"use strict";

const Thread = require("../models/Thread");

exports.createThread = async (req, res) => {
  const board = req.params.board;
  const { text, delete_password } = req.body;

  const thread = new Thread({
    board,
    text,
    delete_password,
    reported: false,
    created_on: new Date(),
    bumped_on: new Date(),
    replies: [],
  });

  await thread.save();
  res.json(thread);
};

exports.getThreads = async (req, res) => {
  const board = req.params.board;
  const threads = await Thread.find({ board })
    .sort({ bumped_on: -1 })
    .limit(10)
    .select("-delete_password -reported -replies.delete_password");
  res.json(threads);
};

exports.reportThread = async (req, res) => {
  const { thread_id } = req.body;
  await Thread.findByIdAndUpdate(thread_id, { reported: true });
  res.send("reported");
};

exports.deleteThread = async (req, res) => {
  const { thread_id, delete_password } = req.body;
  const thread = await Thread.findById(thread_id);

  if (!thread) return res.send("thread not found");
  if (thread.delete_password !== delete_password)
    return res.send("incorrect password");

  await Thread.findByIdAndDelete(thread_id);
  res.send("success");
};
