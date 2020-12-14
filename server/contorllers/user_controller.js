const User = require("../models/user_model");
const got = require("got");

const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const secret = "secret";

const signUp = async (req, res) => {
  const expirationDate = Math.floor(Date.now() / 1000) + 30; // 30 sec
  const signInDate = Math.floor(Date.now() / 1000);
  if (!req.body.name) {
    res.json({ status: 404, msg: "User name cannot be empty" });
    const err = new Error("verify fail");
    err.status = 403;
    next(err);
  } else if (!req.body.email) {
    res.json({ status: 404, msg: "Email cannot be empty" });
  } else if (!req.body.pwd || req.body.pwd.length < 6) {
    res.json({ status: 404, msg: "Password cannot be empty or length less 6" });
  } else {
    const userEmail = req.body.email;
    const result = await User.checkSignUp(userEmail)
    if (result.length > 0) {
      res.json({ status: 404, msg: "account is already exist !!" });
    } else {
      const randomID = Math.floor(Math.random() * 10000) + 1;
      const userPwd = crypto
        .createHash("sha256")
        .update(req.body.pwd)
        .digest("hex");

      const token = jwt.sign(
        { userEmail: req.body.email, exp: expirationDate },
        secret
      );
      const inf = {
        number:randomID,
        name:req.body.name,
        email:req.body.email,
        password:userPwd,
        picture:"123.jpeg",
        provider_id:1,
        access_token:token,
        access_expired:signInDate,
      };
      await User.signUp(inf);
      let user = {
        id: randomID,
        provider: "native",
        name: req.body.name,
        email: req.body.email,
        picture: "123.jepg",
      };
      data = {};
      data.access_token = token;
      data.access_expired = signInDate;
      data.user = user;
      let results = {};
      results.data = data;
      console.log(results.data)
      res.json(results);
    }
  }
};

const signIn = async (req, res) => {
  const expirationDate = Math.floor(Date.now() / 1000) + 3600; // 60 min
  const signInDate = Math.floor(Date.now() / 1000);
  if (!req.body.email) {
    res.json({ status: 404, msg: "Email cannot be empty" });
    return;
  } else if (!req.body.pwd || req.body.pwd.length < 6) {
    // throw new Error("Password cannot be empty or length less 6");
    res.json({ status: 404, msg: "Password cannot be empty or length less 6" });
    return;
  } else {
    const userPwd = crypto
      .createHash("sha256")
      .update(req.body.pwd)
      .digest("hex");
    const userEmail = req.body.email;
    const checkEmail = await User.checkSignIn(userEmail, userPwd)
    if (checkEmail.length === 0) {
      res.json({
        status: 404,
        msg: "email is not exist or password incorrect !",
      });
    } else {
      const token = jwt.sign(
        { userEmail: req.body.email, exp: expirationDate },
        secret
      );
      await User.signIn(token, signInDate, userEmail);
      const result = await User.signInData(userEmail);
      let user = result[0];
      data = {};
      data.access_token = token;
      data.access_expired = signInDate;
      data.user = user;
      let results = {};
      results.data = data;
      res.json(results);
    }
  }
};

const fbSignIn = async (req, res) => {
  const expirationDate = Math.floor(Date.now() / 1000) + 3600; // 60 min
  const signInDate = Math.floor(Date.now() / 1000);
  let url = `https://graph.facebook.com/me?fields=id,name,email&access_token=${req.body.access_token}`;

  try {
    const result = await got(url);
    const userData = JSON.parse(result.body);
    const checkEmail = await User.checkSignUp(userData.email);
    if (checkEmail.length === 1) {
      const token = jwt.sign(
        { userEmail: userData.email, exp: expirationDate },
        secret
      );
      await User.signIn(token, signInDate,userData.email);
      const userInf = await User.signInData(userData.email);
      let user = userInf[0];
      data = {};
      data.access_token = token;
      data.access_expired = signInDate;
      data.user = user;
      let results = {};
      results.data = data;
      res.json(results);
    } else if (checkEmail.length === 0) {
      const randomID = Math.floor(Math.random() * 10000) + 1;
      const token = jwt.sign(
        { userEmail: userData.email, exp: expirationDate },
        secret
      );
      const inf = {
        number:randomID,
        name:userData.name,
        email:userData.email,
        password:null,
        picture:"123.jpeg",
        provider_id:1,
        access_token:token,
        access_expired:signInDate,
      };
      await User.signUp(inf);
      let user = {
        id: userData.id,
        provider: "facebook",
        name: userData.name,
        email: userData.email,
        picture: "123.jepg",
      };
      data = {};
      data.access_token = token;
      data.access_expired = signInDate;
      data.user = user;
      let results = {};
      results.data = data;
      res.json(results);
    } else {
      throw err;
    }
  } catch (error) {
    res.send(err);
  }
};

const getUserProfile = async (req, res) => {
  const signInDate = Math.floor(Date.now() / 1000);
  decode = jwt.verify(req.body.token, secret);
  if (decode.exp > signInDate) {
    const result = await User.getUserProfile(decode.userEmail, req.body.token);
    if (result.length === 0) {
      res.status(404).json({ error: "email is not exist !" });
      return;
    } else {
      res.status(200).json(result[0]);
    }
  } else {
    res.status(404).json({ error: "登入逾時，請重新登入" });
  }
};

module.exports = {
  signUp,
  signIn,
  fbSignIn,
  getUserProfile,
};
