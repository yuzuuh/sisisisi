// controllers/threadController.js
const Thread = require("../models/Thread");

exports.createThread = async (req, res) => {
  try {
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

    // FCC exige redirección, NO JSON
    return res.redirect(`/b/${board}`);
  } catch (err) {
    console.error(err);
    res.send("error creating thread");
  }
};

exports.getThreads = async (req, res) => {
  try {
    const { board } = req.params;

    const threads = await Thread.find({ board })
      .sort({ bumped_on: -1 })
      .limit(10)
      .lean();

    const formatted = threads.map((t) => {
      // tomar SOLO los últimos 3 replies
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

        // remover delete_password y reported
      };
    });

    res.json(formatted);
  } catch (err) {
    console.error(err);
    res.send("error getting threads");
  }
};

exports.deleteThread = async (req, res) => {
  try {
    const { thread_id, delete_password } = req.body;

    const thread = await Thread.findById(thread_id);

    if (!thread) return res.send("thread not found");

    if (thread.delete_password !== delete_password)
      return res.send("incorrect password");

    await Thread.findByIdAndDelete(thread_id);

    res.send("success");
  } catch (err) {
    console.error(err);
    res.send("error deleting thread");
  }
};

exports.reportThread = async (req, res) => {
  try {
    const { thread_id } = req.body;

    const thread = await Thread.findById(thread_id);
    if (!thread) return res.send("thread not found");

    thread.reported = true;
    await thread.save();

    res.send("reported");
  } catch (err) {
    console.error(err);
    res.send("error reporting thread");
  }
};
