require('dotenv').config();
const { SECRET, TOKEN_EXPIRE } = process.env;
const User = require('../models/user_model');
const got = require('got');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

function verifyData(data) {
  let result = new Object();
  if (data.status === 'signUp' && !data.name ) {
    result = {
      error: '會員姓名不得為空！'
    };
  } else if (!data.email) {
    result = {
      error: '信箱不得為空！'
    };
  } else if (!data.pwd || data.pwd.length < 6) {
    result = {
      error: '密碼不得為空或小於6碼！'
    };
  } else if (data.email.split('@').length !== 2) {
    result = {
      error: '信箱驗證錯誤，請輸入符合規範之信箱！'
    };
  } else {
    result = {
      msg: '資料驗證成功!'
    };
  }
  return result;
}

function jwtSign(email, expirationDate) {
  return jwt.sign(
    { userEmail: email, exp: expirationDate },
    SECRET
  );
}

function pwdHash(pwd) {
  return crypto
  .createHash('sha256')
  .update(pwd)
  .digest('hex');
}

const signUp = async (req, res, next) => {
  try {
    const expirationDate = Math.floor(Date.now()/1000 + Number(TOKEN_EXPIRE));
    const signInDate = Math.floor(Date.now());
    const userData = {
      status: 'signUp',
      name: req.body.name,
      email: req.body.email,
      pwd: req.body.pwd,
    };
    const checkResult = verifyData(userData);
    if (checkResult.error) return res.status(400).json(checkResult);
    const result = await User.checkSignUp(userData.email);
    if (result.length > 0) return res.status(400).json({ msg: '此帳號已存在！' });
    const randomID = Math.floor(Math.random() * 10000) + 1;
    const userPwd = pwdHash(userData.pwd);
    const token = jwtSign(userData.email, expirationDate);
    const inf = {
      number:randomID,
      name:req.body.name,
      email:req.body.email,
      password:userPwd,
      picture:'123.jpeg',
      provider_id:1,
      access_token:token,
      access_expired:signInDate,
    };
    await User.signUp(inf);
    const user = {
      id: randomID,
      provider: 'native',
      name: req.body.name,
      email: req.body.email,
      picture: '123.jepg',
    };
    const data = {
      access_token: token,
      access_expired: expirationDate,
      user: user
    };
    res.status(200).json({data: data});
  } catch (error) {
    next(error)
  }
};

const signIn = async (req, res, next) => {
  try {
    const expirationDate = Math.floor(Date.now()/1000 + Number(TOKEN_EXPIRE));
    const signInDate = Math.floor(Date.now());
    const userData = {
      status: 'signIn',
      name: req.body.name,
      email: req.body.email,
      pwd: req.body.pwd,
    };
    const checkResult = verifyData(userData);
    if (checkResult.error) return res.status(403).send(checkResult);
    const userPwd = pwdHash(userData.pwd);
    const checkEmail = await User.checkSignIn(userData.email, userPwd);
    if (checkEmail.length === 0) return res.status(403).json({
      error: '信箱或密碼不正確!'
    });
    const token = jwtSign(userData.email, expirationDate);
    await User.signIn(token, signInDate, userData.email);
    const result = await User.signInData(userData.email);
    const data = {
      access_token: token,
      access_expired: expirationDate,
      user: result[0]
    };
    res.status(200).json({data: data});
  } catch (error) {
    next(error) 
  }
};

const fbSignIn = async (req, res, next) => {
  const expirationDate = Math.floor(Date.now()/1000 + Number(TOKEN_EXPIRE));
  const url = `https://graph.facebook.com/me?fields=id,name,email&access_token=${req.body.access_token}`;

  try {
    const result = await got(url);
    const userData = JSON.parse(result.body);
    const checkEmail = await User.checkSignUp(userData.email);
    if (checkEmail.length === 1) {
      const token = jwtSign(userData.email, expirationDate);
      await User.signIn(token, expirationDate ,userData.email);
      const userInf = await User.signInData(userData.email);
      const user = userInf[0];
      const data = {
        access_token: token,
        access_expired: expirationDate,
        user: user
      };
      res.status(200).json({data: data});
    } else if (checkEmail.length === 0) {
      const randomID = Math.floor(Math.random() * 10000) + 1;
      const token = jwtSign(userData.email, expirationDate);
      const inf = {
        number:randomID,
        name:userData.name,
        email:userData.email,
        password:null,
        picture:'123.jpeg',
        provider_id:1,
        access_token:token,
        access_expired:expirationDate,
      };
      await User.signUp(inf);
      const user = {
        id: userData.id,
        provider: 'facebook',
        name: userData.name,
        email: userData.email,
        picture: '123.jepg',
      };
      const data = {
        access_token: token,
        access_expired: expirationDate,
        user: user
      };
      res.status(200).json({data: data});
    }
  } catch (error) {
    next(error)
  }
};

const getUserProfile = async (req, res, next) => {
  try {
    const signInDate = Math.floor(Date.now()/1000);
    const decode = jwt.verify(req.body.token, SECRET);
    if (decode.exp > signInDate) {
      const result = await User.getUserProfile(decode.userEmail, req.body.token);
      if (result.length === 0) {
        res.status(404).json({ error: '信箱不存在，請重新註冊新會員！' });
        return;
      } else {
        res.status(200).json(result[0]);
      }
    } else {
      res.status(404).json({ error: '登入逾時，請重新登入！' });
    }
  } catch (error) {
    next(error) 
  }
};

module.exports = {
  signUp,
  signIn,
  fbSignIn,
  getUserProfile,
};