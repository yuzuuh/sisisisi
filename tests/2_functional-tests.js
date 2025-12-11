/*
 *
 *
 *       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
 *       -----[Keep the tests in the same order!]-----
 *       (if additional are added, keep them at the very end!)
 */

const chaiHttp = require("chai-http");
const chai = require("chai");
const assert = chai.assert;
const server = require("../server");

chai.use(chaiHttp);

let testThreadId;
let testReplyId;

suite("Functional Tests", () => {
  suite("API ROUTING FOR /api/threads/:board", () => {
    suite("POST", () => {
      test("Create a new thread", (done) => {
        chai
          .request(server)
          .post("/api/threads/test")
          .send({ text: "Test thread", delete_password: "password" })
          .end((err, res) => {
            assert.equal(res.status, 200);
            assert.include(res.type, "text/html");
            done();
          });
      });
    });

    suite("GET", () => {
      test("Get the 10 most recently bumped threads on the board", (done) => {
        chai
          .request(server)
          .get("/api/threads/test")
          .end((err, res) => {
            assert.equal(res.status, 200);
            assert.isArray(res.body);
            assert.isBelow(res.body.length, 11);
            assert.exists(res.body[0]._id);
            testThreadId = res.body[0]._id;
            assert.exists(res.body[0].created_on);
            assert.exists(res.body[0].bumped_on);
            assert.exists(res.body[0].text);
            assert.exists(res.body[0].replies);
            assert.property(res.body[0], "replycount");
            assert.notProperty(res.body[0], "delete_password");
            assert.notProperty(res.body[0], "reported");
            done();
          });
      });
    });

    suite("PUT", () => {
      test("Report a thread", (done) => {
        chai
          .request(server)
          .put("/api/threads/test")
          .send({ report_id: testThreadId })
          .end((err, res) => {
            assert.equal(res.status, 200);
            assert.equal(res.text, "reported");
            done();
          });
      });
    });
  });

  suite("API ROUTING FOR /api/replies/:board", () => {
    suite("POST", () => {
      test("Create a new reply", (done) => {
        chai
          .request(server)
          .post("/api/replies/test")
          .send({
            thread_id: testThreadId,
            text: "Test reply",
            delete_password: "password",
          })
          .end((err, res) => {
            assert.equal(res.status, 200);
            assert.include(res.type, "text/html");
            done();
          });
      });
    });

    suite("GET", () => {
      test("Get a thread with all replies", (done) => {
        chai
          .request(server)
          .get("/api/replies/test")
          .query({ thread_id: testThreadId })
          .end((err, res) => {
            assert.equal(res.status, 200);
            assert.isObject(res.body);
            assert.property(res.body, "_id");
            assert.property(res.body, "text");
            assert.property(res.body, "created_on");
            assert.property(res.body, "bumped_on");
            assert.property(res.body, "replies");
            assert.isArray(res.body.replies);
            assert.notProperty(res.body, "delete_password");
            assert.notProperty(res.body, "reported");

            if (res.body.replies.length > 0) {
              testReplyId = res.body.replies[0]._id;
            }
            done();
          });
      });
    });

    suite("PUT", () => {
      test("Report a reply", (done) => {
        chai
          .request(server)
          .put("/api/replies/test")
          .send({ thread_id: testThreadId, reply_id: testReplyId })
          .end((err, res) => {
            assert.equal(res.status, 200);
            assert.equal(res.text, "reported");
            done();
          });
      });
    });

    suite("DELETE", () => {
      test("Delete a reply with the incorrect delete_password", (done) => {
        chai
          .request(server)
          .delete("/api/replies/test")
          .send({
            thread_id: testThreadId,
            reply_id: testReplyId,
            delete_password: "wrong_password",
          })
          .end((err, res) => {
            assert.equal(res.status, 200);
            assert.equal(res.text, "incorrect password");
            done();
          });
      });

      test("Delete a reply with the correct delete_password", (done) => {
        chai
          .request(server)
          .delete("/api/replies/test")
          .send({
            thread_id: testThreadId,
            reply_id: testReplyId,
            delete_password: "password",
          })
          .end((err, res) => {
            assert.equal(res.status, 200);
            assert.equal(res.text, "success");
            done();
          });
      });
    });
  });

  suite("DELETE /api/threads/:board", () => {
    test("Delete a thread with the incorrect delete_password", (done) => {
      chai
        .request(server)
        .delete("/api/threads/test")
        .send({ thread_id: testThreadId, delete_password: "wrong_password" })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.equal(res.text, "incorrect password");
          done();
        });
    });

    test("Delete a thread with the correct delete_password", (done) => {
      chai
        .request(server)
        .delete("/api/threads/test")
        .send({ thread_id: testThreadId, delete_password: "password" })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.equal(res.text, "success");
          done();
        });
    });
  });
});
