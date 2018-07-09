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

module.exports = router;
