const mongoose = require("mongoose");
const Thread = require("../models/Thread");

module.exports = {
  // CREATE REPLY
  async createReply(req, res) {
    const board = req.params.board;
    const { text, delete_password, thread_id } = req.body;

    const thread = await Thread.findById(thread_id);
    if (!thread) return res.send("thread not found");

    const createdOn = new Date();

    const reply = {
      text,
      delete_password,
      reported: false,
      created_on: createdOn
    };

    thread.replies.push(reply);
    thread.bumped_on = createdOn;

    await thread.save();

    return res.redirect(`/b/${board}/${thread_id}`);
  },

  // GET REPLIES
  async getReplies(req, res) {
    const thread_id = req.query.thread_id;

    const thread = await Thread.findById(thread_id).lean();
    if (!thread) return res.send("thread not found");

    const formattedReplies = thread.replies.map((reply) => ({
      _id: reply._id,
      text: reply.text,
      created_on: reply.created_on
    }));

    const formattedThread = {
      _id: thread._id,
      text: thread.text,
      created_on: thread.created_on,
      bumped_on: thread.bumped_on,
      replies: formattedReplies
    };

    return res.json(formattedThread);
  },

  // REPORT REPLY
  async reportReply(req, res) {
    const { thread_id, reply_id } = req.body;

    const thread = await Thread.findById(thread_id);
    if (!thread) return res.send("thread not found");

    const reply = thread.replies.id(reply_id);
    if (!reply) return res.send("reply not found");

    reply.reported = true;

    await thread.save();

    return res.send("reported");
  },

  // DELETE REPLY
  async deleteReply(req, res) {
    const { thread_id, reply_id, delete_password } = req.body;

    const thread = await Thread.findById(thread_id);
    if (!thread) return res.send("thread not found");

    const reply = thread.replies.id(reply_id);
    if (!reply) return res.send("reply not found");

    if (reply.delete_password !== delete_password)
      return res.send("incorrect password");

    reply.text = "[deleted]";
    await thread.save();

    return res.send("success");
  }
};
