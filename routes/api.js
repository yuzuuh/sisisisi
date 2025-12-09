const mongoose = require("mongoose");
const { Schema } = mongoose;

module.exports = function (app) {
  const boardSchema = new Schema({
    name: { type: String, required: true },
  });

  const threadSchema = new Schema({
    board: { type: String, required: true },
    text: { type: String, required: true },
    delete_password: { type: String, required: true },
    created_on: { type: Date, default: Date.now },
    bumped_on: { type: Date, default: Date.now },
    reported: { type: Boolean, default: false },
    replies: [
      {
        text: { type: String, required: true },
        delete_password: { type: String, required: true },
        created_on: { type: Date, default: Date.now },
        reported: { type: Boolean, default: false },
      },
    ],
  });

  const Board = mongoose.model("Board", boardSchema);
  const Thread = mongoose.model("Thread", threadSchema);

  app
    .route("/api/threads/:board")
    .post(async (req, res) => {
      const { board } = req.params;
      const { text, delete_password } = req.body;

      try {
        const newThread = new Thread({
          board: board,
          text: text,
          delete_password: delete_password,
          created_on: new Date(),
          bumped_on: new Date(),
          replies: [],
        });

        await newThread.save();
        res.redirect(`/b/${board}`);
      } catch (err) {
        console.error(err);
        res.status(500).send("Error creating thread");
      }
    })
    .get(async (req, res) => {
      const { board } = req.params;

      try {
        const threads = await Thread.find({ board: board })
          .sort({ bumped_on: "desc" })
          .limit(10)
          .lean()
          .exec();

        const formattedThreads = threads.map((thread) => {
          const replies = thread.replies
            .sort((a, b) => new Date(b.created_on) - new Date(a.created_on))
            .slice(0, 3);
          return {
            ...thread,
            replies: replies,
            replycount: thread.replies.length,
          };
        });

        res.json(formattedThreads);
      } catch (err) {
        console.error(err);
        res.status(500).send("Error getting threads");
      }
    })
    .delete(async (req, res) => {
      const { board } = req.params;
      const { thread_id, delete_password } = req.body;

      try {
        const thread = await Thread.findById(thread_id);

        if (!thread) {
          return res.send("thread not found");
        }
        if (thread.delete_password !== delete_password) {
          return res.send("incorrect password");
        }

        await Thread.findByIdAndDelete(thread_id);
        res.send("success");
      } catch (err) {
        console.error(err);
        res.status(500).send("Error deleting thread");
      }
    })
    .put(async (req, res) => {
      const { board } = req.params;
      const { thread_id } = req.body;

      try {
        const thread = await Thread.findById(thread_id);
        if (!thread) {
          return res.send("thread not found");
        }

        thread.reported = true;
        await thread.save();
        res.send("reported");
      } catch (err) {
        console.error(err);
        res.status(500).send("Error reporting thread");
      }
    });

  app
    .route("/api/replies/:board")
    .post(async (req, res) => {
      const { board } = req.params;
      const { text, delete_password, thread_id } = req.body;

      try {
        const thread = await Thread.findById(thread_id);

        if (!thread) {
          return res.send("thread not found");
        }

        const newReply = {
          text: text,
          delete_password: delete_password,
          created_on: new Date(),
          reported: false,
        };

        thread.replies.push(newReply);
        thread.bumped_on = new Date();

        await thread.save();
        res.redirect(`/b/${board}/${thread_id}`);
      } catch (err) {
        console.error(err);
        res.status(500).send("Error creating reply");
      }
    })
    .get(async (req, res) => {
      const { board } = req.params;
      const { thread_id } = req.query;

      try {
        const thread = await Thread.findById(thread_id).lean();

        if (!thread) {
          return res.send("thread not found");
        }

        const replies = thread.replies.map((reply) => ({
          _id: reply._id,
          text: reply.text,
          created_on: reply.created_on,
          delete_password: reply.delete_password,
          reported: reply.reported,
        }));
        res.json(replies);
      } catch (err) {
        console.error(err);
        res.status(500).send("Error getting replies");
      }
    })
    .put(async (req, res) => {
      const { board } = req.params;
      const { thread_id, reply_id } = req.body;

      try {
        const thread = await Thread.findById(thread_id);

        if (!thread) {
          return res.send("thread not found");
        }

        const reply = thread.replies.id(reply_id);

        if (!reply) {
          return res.send("reply not found");
        }

        reply.reported = true;
        await thread.save();

        res.send("reported");
      } catch (err) {
        console.error(err);
        res.status(500).send("Error reporting reply");
      }
    })
    .delete(async (req, res) => {
      const { board } = req.params;
      const { thread_id, reply_id, delete_password } = req.body;

      try {
        const thread = await Thread.findById(thread_id);

        if (!thread) {
          return res.send("thread not found");
        }

        const reply = thread.replies.id(reply_id);

        if (!reply) {
          return res.send("reply not found");
        }

        if (reply.delete_password !== delete_password) {
          return res.send("incorrect password");
        }

        reply.remove();
        thread.bumped_on = new Date();
        await thread.save();

        res.send("success");
      } catch (err) {
        console.error(err);
        res.status(500).send("Error deleting reply");
      }
    });
};
