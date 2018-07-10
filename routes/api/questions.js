const express = require("express");
const router = express.Router();
const passport = require("passport");

//@type GET
//@route /api/questions
//@desc route for showing all questions
//@access PUBLIC

router.get("/", (req, res) => {
  Question.find()
    .sort("-date")
    .then(questions => res.json(questions))
    .catch(err => res.json({ noquestions: "No question to display" }));
});

const Question = require("../../models/Question");
2;
const Profile = require("../../models/Profile");

//@type POST
//@route /api/questions
//@desc route for submitting question
//@access PRIVATE

router.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const newQuetion = new Question({
      textone: req.body.textone,
      texttwo: req.body.texttwo,
      user: req.user.id,
      name: req.body.name
    });
    newQuetion
      .save()
      .then(question => {
        res.json(question);
      })
      .catch(err => console.log(err));
  }
);

//@type POST
//@route /api/questions/answers/:id
//@desc route for ubmitting answers to questions
//@access PRIVATE

router.post(
  "/answers/:id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Question.findById(req.params.id)
      .then(question => {
        const newAnswer = {
          user: req.user.id,
          name: req.body.name,
          text: req.body.text
        };
        question.answers.unshift(newAnswer);
        question
          .save()
          .then(question => res.json(question))
          .catch(err => console.log(err));
      })
      .catch(err => console.log(err));
  }
);

//@type POST
//@route /api/questions/upvote/:id
//@desc route for upvoting questions
//@access PRIVATE

router.post(
  "/upvote/:id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Profile.findOne({ user: req.user.id })
      .then(profile => {
        Question.findById(req.params.id)
          .then(question => {
            if (
              question.upvotes.filter(
                upvote => upvote.user.toString() === req.user.id.toString()
              ).length > 0
            ) {
              let index = question.upvotes
                .map(upvote => upvote.user)
                .indexOf(req.user.id);
              question.upvotes.splice(index, 1);
              return question
                .save()
                .then(question => res.json(question))
                .catch(err => console.log("err while downviting" + err));
            }
            question.upvotes.unshift({ user: req.user.id });
            question
              .save()
              .then(quetion => res.json(question))
              .catch(err => console.log(err));
          })
          .catch(err => console.log(err));
      })
      .catch(err => console.log(err));
  }
);

//Asignment
//delete quetions

//@type DELETE
//@route /api/questions/:id
//@desc route to delete question posted by user
//@access PRIVATE

router.delete(
  "/:id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Profile.findOne({ user: req.user.id })
      .then(profile => {
        Question.findOne({ user: req.user.id })
          .then(question => {
            if (!question) {
              return res
                .status(404)
                .json({ questionerror: "question not found" });
            }
            Question.findByIdAndRemove(req.params.id)
              .then(question => res.json(question))
              .catch(err => console.log(err));
          })
          .catch(err => console.log(err));
      })
      .catch(err => console.log(err));
  }
);

//delete all quetions

//Create a separate rout for linux questions

module.exports = router;
