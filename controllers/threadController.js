const Thread = require("../models/Thread");

// CREATE THREAD
exports.createThread = async (req, res) => {
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

  await newThread.save();

  return res.redirect(`/b/${board}/`);
};

// GET THREADS (FCC: must include text + limit replies to 3)
exports.getThreads = async (req, res) => {
  const { board } = req.params;

  const threads = await Thread.find({ board })
    .sort({ bumped_on: -1 })
    .limit(10)
    .lean();

  const formatted = threads.map((t) => ({
    _id: t._id,
    text: t.text,
    created_on: t.created_on,
    bumped_on: t.bumped_on,
    replycount: t.replies.length,
    replies: t.replies.slice(-3).map((r) => ({
      _id: r._id,
      text: r.text,
      created_on: r.created_on,
    })),
  }));

  res.json(formatted);
};

// DELETE THREAD
exports.deleteThread = async (req, res) => {
  const { thread_id, delete_password } = req.body;

  const thread = await Thread.findById(thread_id);
  if (!thread) return res.send("incorrect password");

  if (thread.delete_password !== delete_password)
    return res.send("incorrect password");

  await Thread.findByIdAndDelete(thread_id);
  res.send("success");
};

// REPORT THREAD
exports.reportThread = async (req, res) => {
  const thread_id = req.body.thread_id || req.body.report_id;

  const thread = await Thread.findById(thread_id);
  if (!thread) return res.send("thread not found");

  thread.reported = true;
  await thread.save();

  res.send("reported");
};
