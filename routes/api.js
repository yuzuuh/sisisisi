"use strict";

const Thread = require("../models/Thread");

module.exports = function (app) {
  // POST THREAD
  app.post("/api/threads/:board", async (req, res) => {
    const { board } = req.params;
    const { text, delete_password } = req.body;

    const newThread = new Thread({
      board,
      text,
      delete_password,
      created_on: new Date(),
      bumped_on: new Date(),
      reported: false,
      replies: [],
    });

    try {
      const savedThread = await newThread.save();
      res.json(savedThread); // FCC prefiere JSON
    } catch (err) {
      console.error(err);
      res.status(500).send("Error creating thread");
    }
  });

  // GET THREADS
  app.get("/api/threads/:board", async (req, res) => {
    const { board } = req.params;

    try {
      const threads = await Thread.find({ board })
        .sort({ bumped_on: -1 })
        .limit(10)
        .lean();

      const formatted = threads.map((thread) => {
        const replies = thread.replies.slice(-3).map((r) => {
          const { delete_password, reported, ...safe } = r;
          return safe;
        });

        const { delete_password, reported, ...safeThread } = thread;
        return { ...safeThread, replies };
      });

      res.json(formatted);
    } catch (err) {
      console.error(err);
      res.status(500).send("Error retrieving threads");
    }
  });

  // DELETE THREAD
  app.delete("/api/threads/:board", async (req, res) => {
    const { thread_id, delete_password } = req.body;

    try {
      const thread = await Thread.findById(thread_id);
      if (!thread) return res.send("Thread not found");

      if (thread.delete_password !== delete_password) {
        return res.send("incorrect password");
      }

      await Thread.findByIdAndDelete(thread_id);
      res.send("success");
    } catch (err) {
      console.error(err);
      res.status(500).send("Error deleting thread");
    }
  });

  // REPORT THREAD
  app.put("/api/threads/:board", async (req, res) => {
    const { thread_id } = req.body;

    try {
      const thread = await Thread.findById(thread_id);
      if (!thread) return res.send("Thread not found");

      thread.reported = true;
      await thread.save();

      res.send("reported");
    } catch (err) {
      console.error(err);
      res.status(500).send("Error reporting thread");
    }
  });

  // POST REPLY
  app.post("/api/replies/:board", async (req, res) => {
    const { text, delete_password, thread_id } = req.body;

    try {
      const thread = await Thread.findById(thread_id);
      if (!thread) return res.send("Thread not found");

      const reply = {
        text,
        delete_password,
        created_on: new Date(),
        reported: false,
      };

      thread.replies.push(reply);
      thread.bumped_on = new Date();
      await thread.save();

      res.json(thread);
    } catch (err) {
      console.error(err);
      res.status(500).send("Error adding reply");
    }
  });

  // GET REPLIES
  app.get("/api/replies/:board", async (req, res) => {
    const { thread_id } = req.query;

    try {
      const thread = await Thread.findById(thread_id).lean();
      if (!thread) return res.send("Thread not found");

      const replies = thread.replies.map((r) => {
        const { delete_password, reported, ...safe } = r;
        return safe;
      });

      const { delete_password, reported, ...safeThread } = thread;

      res.json({ ...safeThread, replies });
    } catch (err) {
      console.error(err);
      res.status(500).send("Error retrieving replies");
    }
  });

  // REPORT REPLY
  app.put("/api/replies/:board", async (req, res) => {
    const { thread_id, reply_id } = req.body;

    try {
      const thread = await Thread.findById(thread_id);
      if (!thread) return res.send("Thread not found");

      const reply = thread.replies.id(reply_id);
      if (!reply) return res.send("Reply not found");

      reply.reported = true;
      await thread.save();

      res.send("reported");
    } catch (err) {
      console.error(err);
      res.status(500).send("Error reporting reply");
    }
  });

  // DELETE REPLY
  app.delete("/api/replies/:board", async (req, res) => {
    const { thread_id, reply_id, delete_password } = req.body;

    try {
      const thread = await Thread.findById(thread_id);
      if (!thread) return res.send("Thread not found");

      const reply = thread.replies.id(reply_id);
      if (!reply) return res.send("Reply not found");

      if (reply.delete_password !== delete_password) {
        return res.send("incorrect password");
      }

      reply.text = "[deleted]";
      await thread.save();
      res.send("success");
    } catch (err) {
      console.error(err);
      res.status(500).send("Error deleting reply");
    }
  });
};
