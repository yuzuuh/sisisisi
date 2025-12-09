// controllers/threadController.js
const mongoose = require("mongoose");
const Thread = require("../models/Thread");

exports.createThread = async (req, res) => {
  const { board } = req.params;
  const { text, delete_password } = req.body;

  const thread = new Thread({
    board,
    text,
    delete_password,
    created_on: new Date(),
    bumped_on: new Date(),
    reported: false,
    replies: [],
  });

  const saved = await thread.save();
  res.json(saved);
};

exports.getThreads = async (req, res) => {
  const { board } = req.params;

  const threads = await Thread.find({ board })
    .sort({ bumped_on: -1 })
    .limit(10)
    .lean();

  const formatted = threads.map((t) => {
    const replies = t.replies.slice(-3).map((r) => ({
      _id: r._id,
      text: r.text,
      created_on: r.created_on,
    }));

    return {
      _id: t._id,
      text: t.text,
      created_on: t.created_on,
      bumped_on: t.bumped_on,
      replies,
    };
  });

  res.json(formatted);
};

exports.deleteThread = async (req, res) => {
  const { thread_id, delete_password } = req.body;

  const thread = await Thread.findById(thread_id);
  if (!thread) return res.send("incorrect password");

  if (thread.delete_password !== delete_password)
    return res.send("incorrect password");

  await Thread.findByIdAndDelete(thread_id);
  res.send("success");
};

exports.reportThread = async (req, res) => {
  const { thread_id } = req.body;

  const thread = await Thread.findById(thread_id);
  if (!thread) return res.send("not found");

  thread.reported = true;
  await thread.save();

  res.send("reported");
};
