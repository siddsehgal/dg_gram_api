const router = require("express").Router();
const Users = require("./database/user");
const axios = require("axios");
const sendEmail = require("./services/sendEmail");
const jwt = require("jsonwebtoken");

const TIME_API_URL = process.env.TIME_API_URL;
const MY_EMAIL = process.env.MY_EMAIL;
const SECRET_KEY = process.env.SECRET_KEY;

router.get("/api/signin", function (req, res) {
  res.send("Sign In");
});

router.post("/api/signup", async function (req, res) {
  // console.log(req.body);
  const { name, email, password } = req.body;

  var isEmailSendSuccess = await sendEmail({
    from: MY_EMAIL,
    to: "sidjaggal@gmail.com",
    subject: "Sending Email using Node.js",
    text: "That was easy!",
  });
  console.log(isEmailSendSuccess);
  var joinDate;
  try {
    let response = await axios.get(TIME_API_URL);
    joinDate = response.data.datetime;
  } catch (err) {
    console.log(err);
    joinDate = new Date().toString();
  }

  var newUser = new Users({
    name,
    email: email.toLowerCase(),
    password,
    joinDate,
    followers: [],
    following: [],
    posts: [],
    verified: false,
  });

  newUser["userId"] = newUser["_id"];

  newUser.save(function (err, data) {
    let response = {};
    if (err) {
      let msg =
        err.code === 11000
          ? "An account already exist with this Email Address!!"
          : `Unknown Error Occured (${err.code})`;

      response = {
        error: true,
        body: { msg: msg },
      };

      console.log(response);
      res.send(response);
    } else {
      let { name, email, joinDate, verified, userId } = data;

      let token = jwt.sign({ userId }, SECRET_KEY, { expiresIn: "3h" });

      response = {
        error: false,
        body: {
          msg: "SignUp Successfully!!!",
          data: { name, email, joinDate, verified, userId, token },
        },
      };
      console.log(response);
      res.cookie("Data", data);
      res.send(response);
    }
  });
});

module.exports = router;
