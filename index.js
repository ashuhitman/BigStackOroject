const express = require("express");
const mongoose = require("mongoose");
const bodyparser = require("body-parser");
const passport = require("passport");

// bring all routes
const auth = require("./routes/api/auth");
const profile = require("./routes/api/profile");
const questions = require("./routes/api/questions");
const app = express();

//middleare for body-parser
app.use(bodyparser.urlencoded({ extended: false }));
app.use(bodyparser.json());

//mongoDB config
const db = require("./setup/myurl").mongoURL;

//Attempt to connect to DB

mongoose
  .connect(
    db,
    { useNewUrlParser: true }
  )
  .then(() => console.log("mongoDB connected successfully"))
  .catch(err => console.log(err));

//passport middleware
app.use(passport.initialize());

//config for jwt strategy
require("./strategies/jsonwtstrategy")(passport);

//just for teting route
app.get("/", (req, res) => {
  res.send("hey there big stack");
});

//actual routes
app.use("/api/auth", auth);
app.use("/api/profile", profile);
app.use("/api/questions", questions);

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running at port ${port}`);
});
