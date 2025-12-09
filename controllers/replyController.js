// controllers/replyController.js
const mongoose = require("mongoose");
const Thread = require("../models/Thread");

module.exports = {
  // CREATE REPLY
  async createReply(req, res) {
    try {
      const board = req.params.board;
      const { text, delete_password, thread_id } = req.body;

      const thread = await Thread.findById(thread_id);
      if (!thread) return res.send("thread not found");

      const created_on = new Date();

      const reply = {
        _id: new mongoose.Types.ObjectId(), // <<< OBLIGATORIO PARA FCC
        text,
        delete_password,
        created_on,
        reported: false,
      };

      // Add reply
      thread.replies.push(reply);

      // FCC exige actualizar bumped_on
      thread.bumped_on = created_on;

      await thread.save();

      // FCC exige esta redirección exacta
      return res.redirect(`/b/${board}/${thread_id}`);
    } catch (err) {
      console.error(err);
      res.send("error creating reply");
    }
  },

  // GET REPLIES
  async getReplies(req, res) {
    try {
      const thread_id = req.query.thread_id;
      const thread = await Thread.findById(thread_id).lean();

      if (!thread) return res.send("thread not found");

      // Estructura EXACTA que FCC pide:
      const formattedThread = {
        _id: thread._id,
        text: thread.text,
        created_on: thread.created_on,
        bumped_on: thread.bumped_on,
        board: thread.board,
        replies: thread.replies.map((r) => ({
          _id: r._id,
          text: r.text,
          created_on: r.created_on,
          reported: r.reported,
          delete_password: r.delete_password,
        })),
      };

      res.json(formattedThread);
    } catch (err) {
      console.error(err);
      res.send("error getting replies");
    }
  },

  // REPORT REPLY
  async reportReply(req, res) {
    try {
      const { thread_id, reply_id } = req.body;

      const thread = await Thread.findById(thread_id);
      if (!thread) return res.send("thread not found");

      const reply = thread.replies.id(reply_id);
      if (!reply) return res.send("reply not found");

      reply.reported = true;

      await thread.save();

      res.send("reported");
    } catch (err) {
      console.error(err);
      res.send("error reporting reply");
    }
  },

  // DELETE REPLY
  async deleteReply(req, res) {
    try {
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
    } catch (err) {
      console.error(err);
      res.send("error deleting reply");
    }
  },
};
