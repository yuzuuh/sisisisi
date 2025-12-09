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

  const savedThread = await newThread.save();

  // FCC requires returning JSON of created thread
  return res.json({
    _id: savedThread._id,
    text: savedThread.text,
    created_on: savedThread.created_on,
    bumped_on: savedThread.bumped_on,
    reported: savedThread.reported,
    delete_password: savedThread.delete_password,
    replies: savedThread.replies,
  });
};

// GET THREADS
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
  if (!thread) return res.send("thread not found");

  if (thread.delete_password !== delete_password)
    return res.send("incorrect password");

  await Thread.findByIdAndDelete(thread_id);
  res.send("success");
};

// REPORT THREAD
exports.reportThread = async (req, res) => {
  const { thread_id } = req.body;

  const thread = await Thread.findById(thread_id);
  if (!thread) return res.send("thread not found");

  thread.reported = true;
  await thread.save();

  res.send("reported");
};
