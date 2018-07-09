const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const passport = require("passport");
const key = require("../../setup/myurl");

//@type GET
//route /api/auth
//@desc just for testing
//@access PUBLIC

router.get("/", (req, res) => res.json({ test: "Auth is being tested" }));

//Import Schema for Person to Register
const Person = require("../../models/Person");

//@type POST
//route /api/auth/register
//@desc route for registration of users
//@access PUBLIC

router.post("/register", (req, res) => {
  Person.findOne({ email: req.body.email })
    .then(person => {
      if (person) {
        return res
          .status(400)
          .json({ emailerror: "Email is already registered in our system" });
      } else {
        if (!req.body.profilepic && req.body.gender === "female") {
          req.body.profilepic = "female.png";
        }
        const newPerson = new Person({
          name: req.body.name,
          email: req.body.email,
          password: req.body.password,
          gender: req.body.gender,
          profilepic: req.body.profilepic
        });

        //Encrypt password using bcryptjs
        bcrypt.genSalt(10, (err, salt) => {
          bcrypt.hash(newPerson.password, salt, (err, hash) => {
            if (err) throw err;
            newPerson.password = hash;
            newPerson
              .save()
              .then(person => res.json(person))
              .catch(err => console.log(err));
          });
        });
      }
    })
    .catch(err => console.log(err));
});

//@type POST
//route /api/auth/login
//@desc route for login of users
//@access PUBLIC

router.post("/login", (req, res) => {
  var email = req.body.email;
  var password = req.body.password;
  Person.findOne({ email })
    .then(person => {
      if (!person) {
        return res.status(404).json({ loginerror: "User not found" });
      }
      bcrypt
        .compare(password, person.password)
        .then(isCorrect => {
          if (isCorrect) {
            //res.json({ success: "User is able to login sccessfully" });
            //use payload and createbtoken for user here
            const payload = {
              id: person.id,
              name: person.name,
              email: person.email
            };
            jwt.sign(payload, key.secret, { expiresIn: 3600 }, (err, token) => {
              if (err) throw err;
              if (token) {
                res.json({ success: true, token: "Bearer " + token });
              } else {
                res.json({ success: false });
              }
            });
          } else {
            res.status(400).json({ passworderror: "Password is not correct" });
          }
        })
        .catch(err => console.log(err));
    })
    .catch(err => console.log(err));
});

//@type GET
//route /api/auth/profile
//@desc route for user profile
//@access PRIVATE

router.get(
  "/profile",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    res.json({
      id: req.user.id,
      name: req.user.name,
      email: req.user.email,
      profilepic: req.user.profilepic,
      gender: req.user.gender
    });
  }
);

module.exports = router;
