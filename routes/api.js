"use strict";

const threadController = require("../controllers/threadController");
const replyController = require("../controllers/replyController");

module.exports = function (app) {
  app
    .route("/api/threads/:board")
    .get(threadController.createThread)
    .post(threadController.getThreads)
    .put(threadController.reportThread)
    .delete(threadController.deleteThread);

  app
    .route("/api/replies/:board")
    .get(replyController.createReply)
    .post(replyController.getReplies)
    .put(replyController.reportReply)
    .delete(replyController.deleteReply);
};
