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

function jwtSign(email, expire) {
  return jwt.sign(
    { userEmail: email, exp: expire },
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
    const expire = Math.floor(Date.now()/1000 + Number(TOKEN_EXPIRE));
    const sign_in_date = Math.floor(Date.now());
    const user_data = {
      status: 'signUp',
      name: req.body.name,
      email: req.body.email,
      pwd: req.body.pwd,
    };
    const check_result = verifyData(user_data);
    if (check_result.error) return res.status(400).json(check_result);
    const result = await User.checkSignUp(user_data.email);
    if (result.length > 0) return res.status(400).json({ error: '此帳號已存在！' });
    const random_id = Math.floor(Math.random() * 10000) + 1;
    const userPwd = pwdHash(user_data.pwd);
    const token = jwtSign(user_data.email, expire);
    const inf = {
      number:random_id,
      name:req.body.name,
      email:req.body.email,
      password:userPwd,
      picture:'123.jpeg',
      provider_id:1,
      access_token:token,
      access_expired:sign_in_date,
    };
    await User.signUp(inf);
    const user = {
      id: random_id,
      provider: 'native',
      name: req.body.name,
      email: req.body.email,
      picture: '123.jepg',
    };
    const data = {
      access_token: token,
      access_expired: expire,
      user: user
    };
    res.status(200).json({data: data});
  } catch (error) {
    next(error)
  }
};

const signIn = async (req, res, next) => {
  try {
    const expire = Math.floor(Date.now()/1000 + Number(TOKEN_EXPIRE));
    const sign_in_date = Math.floor(Date.now());
    const user_data = {
      status: 'signIn',
      name: req.body.name,
      email: req.body.email,
      pwd: req.body.pwd,
    };
    const check_result = verifyData(user_data);
    if (check_result.error) return res.status(403).send(check_result);
    const userPwd = pwdHash(user_data.pwd);
    const check_email = await User.checkSignIn(user_data.email, userPwd);
    if (check_email.length === 0) return res.status(403).json({
      error: '信箱或密碼不正確!'
    });
    const token = jwtSign(user_data.email, expire);
    await User.signIn(token, sign_in_date, user_data.email);
    const result = await User.signInData(user_data.email);
    const data = {
      access_token: token,
      access_expired: expire,
      user: result[0]
    };
    res.status(200).json({data: data});
  } catch (error) {
    next(error) 
  }
};

const fbSignIn = async (req, res, next) => {
  const expire = Math.floor(Date.now()/1000 + Number(TOKEN_EXPIRE));
  const url = `https://graph.facebook.com/me?fields=id,name,email&access_token=${req.body.access_token}`;

  try {
    const result = await got(url);
    const user_data = JSON.parse(result.body);
    const check_email = await User.checkSignUp(user_data.email);
    if (check_email.length === 1) {
      const token = jwtSign(user_data.email, expire);
      await User.signIn(token, expire ,user_data.email);
      const userInf = await User.signInData(user_data.email);
      const user = userInf[0];
      const data = {
        access_token: token,
        access_expired: expire,
        user: user
      };
      res.status(200).json({data: data});
    } else if (check_email.length === 0) {
      const random_id = Math.floor(Math.random() * 10000) + 1;
      const token = jwtSign(user_data.email, expire);
      const inf = {
        number:random_id,
        name:user_data.name,
        email:user_data.email,
        password:null,
        picture:'123.jpeg',
        provider_id:1,
        access_token:token,
        access_expired:expire,
      };
      await User.signUp(inf);
      const user = {
        id: user_data.id,
        provider: 'facebook',
        name: user_data.name,
        email: user_data.email,
        picture: '123.jepg',
      };
      const data = {
        access_token: token,
        access_expired: expire,
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
    const sign_in_date = Math.floor(Date.now()/1000);
    const decode = jwt.verify(req.body.token, SECRET);
    if (decode.exp > sign_in_date) {
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