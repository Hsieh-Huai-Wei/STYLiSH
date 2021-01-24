require("dotenv").config();
const { SECRET, TOKEN_EXPIRE } = process.env;
const User = require("../models/user_model");
const got = require("got");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");

function verifyData(data) {
  if (data.status === "signUp" && !data.name ) {
    return result = {
      check: false,
      status: 404,
      msg: "會員姓名不得為空！"
    }
  } else if (!data.email) {
    return result = {
      check: false,
      status: 404,
      msg: "信箱不得為空！"
    }
  } else if (!data.pwd || data.pwd.length < 6) {
    return result = {
      check: false,
      status: 404,
      msg: "密碼不得為空或小於6碼！"
    }
  } else if (data.email.split('@').length !== 2) {
    return result = {
      check: false,
      status: 404,
      msg: "信箱驗證錯誤，請輸入符合規範之信箱！"
    }
  } else {
    return result = {
      check: true
    }
  }
}

function jwtSign(email, expirationDate) {
  return jwt.sign(
    { userEmail: email, exp: expirationDate },
    SECRET
  );
}

function pwdHash(pwd) {
  return crypto
  .createHash("sha256")
  .update(pwd)
  .digest("hex");
}

const signUp = async (req, res) => {
  const expirationDate = Math.floor(Date.now()/1000 + Number(TOKEN_EXPIRE));
  const signInDate = Math.floor(Date.now());
  const userData = {
    status: "signUp",
    name: req.body.name,
    email: req.body.email,
    pwd: req.body.pwd,
  }
  const checkResult = verifyData(userData);
  if (!checkResult.check) return res.send(checkResult);
  const result = await User.checkSignUp(userData.email);
  if (result.length > 0) return res.json({ status: 404, msg: "此帳號已存在！" });
  const randomID = Math.floor(Math.random() * 10000) + 1;
  const userPwd = pwdHash(userData.pwd);
  const token = jwtSign(userData.email, expirationDate)
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
  const user = {
    id: randomID,
    provider: "native",
    name: req.body.name,
    email: req.body.email,
    picture: "123.jepg",
  };
  const data = {
    access_token: token,
    access_expired: expirationDate,
    user: user
  };
  res.json({data: data});
};

const signIn = async (req, res) => {
  const expirationDate = Math.floor(Date.now()/1000 + Number(TOKEN_EXPIRE));
  const signInDate = Math.floor(Date.now());
  const userData = {
    status: "signIn",
    name: req.body.name,
    email: req.body.email,
    pwd: req.body.pwd,
  }
  const checkResult = verifyData(userData);
  if (!checkResult.check) return res.send(checkResult);
  const userPwd = pwdHash(userData.pwd);
  const checkEmail = await User.checkSignIn(userData.email, userPwd)
  console.log(checkEmail)
  if (checkEmail.length === 0) return res.json({
    status: 404,
    msg: "信箱或密碼不正確!",
  });
  const token = jwtSign(userData.email, expirationDate)
  await User.signIn(token, signInDate, userData.email);
  const result = await User.signInData(userData.email);
  const data = {
    access_token: token,
    access_expired: expirationDate,
    user: result[0]
  };
  res.json({data: data});
};

const fbSignIn = async (req, res) => {
  const expirationDate = Math.floor(Date.now()/1000 + Number(TOKEN_EXPIRE));
  let url = `https://graph.facebook.com/me?fields=id,name,email&access_token=${req.body.access_token}`;

  try {
    const result = await got(url);
    const userData = JSON.parse(result.body);
    const checkEmail = await User.checkSignUp(userData.email);
    if (checkEmail.length === 1) {
      const token = jwtSign(userData.email, expirationDate)
      await User.signIn(token, expirationDate ,userData.email);
      const userInf = await User.signInData(userData.email);
      const user = userInf[0];
      const data = {
        access_token: token,
        access_expired: expirationDate,
        user: user
      };
      res.json({data: data});
    } else if (checkEmail.length === 0) {
      const randomID = Math.floor(Math.random() * 10000) + 1;
      const token = jwtSign(userData.email, expirationDate)
      const inf = {
        number:randomID,
        name:userData.name,
        email:userData.email,
        password:null,
        picture:"123.jpeg",
        provider_id:1,
        access_token:token,
        access_expired:expirationDate,
      };
      await User.signUp(inf);
      const user = {
        id: userData.id,
        provider: "facebook",
        name: userData.name,
        email: userData.email,
        picture: "123.jepg",
      };
      const data = {
        access_token: token,
        access_expired: expirationDate,
        user: user
      };
      res.json({data: data});
    }
  } catch (error) {
    res.send(error);
  }
};

const getUserProfile = async (req, res) => {
  const signInDate = Math.floor(Date.now()/1000);
  decode = jwt.verify(req.body.token, SECRET);
  if (decode.exp > signInDate) {
    const result = await User.getUserProfile(decode.userEmail, req.body.token);
    if (result.length === 0) {
      res.status(404).json({ error: "信箱不存在，請重新註冊新會員！" });
      return;
    } else {
      res.status(200).json(result[0]);
    }
  } else {
    res.status(404).json({ error: "登入逾時，請重新登入！" });
  }
};

module.exports = {
  signUp,
  signIn,
  fbSignIn,
  getUserProfile,
};