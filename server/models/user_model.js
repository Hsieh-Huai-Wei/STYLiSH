require("dotenv").config();
const mysql = require("mysql");
const { HOST, USERNAME2, PASSWORD, DATABASE } = process.env;
const got = require("got");

// DB connection
const con = mysql.createConnection({
  host: HOST, // MYSQL HOST NAME
  user: USERNAME2, // MYSQL USERNAME
  password: PASSWORD, // MYSQL PASSWORD
  database: DATABASE, // MYSQL DB NAME
});

con.connect(function (err) {
  if (err) throw err;
  // console.log("Connected!");
});

const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const secret = "secret";

const signUp = async (req, res) => {
  const expirationDate = Math.floor(Date.now() / 1000) + 30; // 30 sec
  const signInDate = Math.floor(Date.now() / 1000);
  if (!req.body.name) {
    res.json({ status: 404, msg: "User name cannot be empty" });
    // return;
    const err = new Error("verify fail");
    err.status = 403;
    next(err);
  } else if (!req.body.email) {
    res.json({ status: 404, msg: "Email cannot be empty" });
  } else if (!req.body.pwd || req.body.pwd.length < 6) {
    res.json({ status: 404, msg: "Password cannot be empty or length less 6" });
  } else {
    sql = `SELECT * FROM user WHERE email = "${req.body.email}"`;
    con.query(sql, function (err, result) {
      if (err) {
        res.json({ status: 404, msg: "database broken !!" });
      } else if (result.length > 0) {
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
        sql =
          "INSERT INTO user SET number = ?, name = ?, email = ?, password = ?, picture = ?, provider_id = ?, access_token = ?, access_expired = ?";

        con.query(
          sql,
          [
            randomID,
            req.body.name,
            req.body.email,
            userPwd,
            "123.jpeg",
            1,
            token,
            signInDate,
          ],
          function (err) {
            if (err) {
              res.json({ status: 404, msg: "database broken !!" });
            }
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
            res.json(results);
          }
        );
      }
    });
  }
};

const signIn = async (req, res) => {
  const expirationDate = Math.floor(Date.now() / 1000) + 3600; // 60 min
  const signInDate = Math.floor(Date.now() / 1000);
  if (!req.body.email) {
    res.json({ status: 404, msg: "Email cannot be empty" });
    return
  } else if (!req.body.pwd || req.body.pwd.length < 6) {
    // throw new Error("Password cannot be empty or length less 6");
    res.json({ status: 404, msg: "Password cannot be empty or length less 6" });
    return
  } else {
    const userPwd = crypto
      .createHash("sha256")
      .update(req.body.pwd)
      .digest("hex");
    sql = `SELECT * FROM user WHERE email = "${req.body.email}" AND password = "${userPwd}"`;
    con.query(sql, function (err, result) {
      if (err) {
        res.json({ status: 404, msg: "database broken !!" });
      } else if (result.length === 0) {
        res.json({
          status: 404,
          msg: "email is not exist or password incorrect !",
        });
      } else {
        const token = jwt.sign(
          { userEmail: req.body.email, exp: expirationDate },
          secret
        );

        sql = `UPDATE user SET access_token = "${token}", access_expired = "${signInDate}" WHERE email = ?`;

        con.query(sql, req.body.email, function (err) {
          if (err) throw err;

          sql = `SELECT number AS id, provider_id AS provider, name, email, picture FROM user WHERE email = ?`;

          con.query(sql, req.body.email, function (err, result) {
            if (err) throw err;
            let user = result[0];
            data = {};
            data.access_token = token;
            data.access_expired = signInDate;
            data.user = user;
            let results = {};
            results.data = data;
            res.json(results);
          });
        });
      }
    });
  }
};

const fbSignIn = async (req, res) => {
  const expirationDate = Math.floor(Date.now() / 1000) + 3600; // 60 min
  const signInDate = Math.floor(Date.now() / 1000);
  let url = `https://graph.facebook.com/me?fields=id,name,email&access_token=${req.body.access_token}`;

  try {
    let result = await got(url);
    // console.log(req.body.access_token) //token
    //because this object in response, not in request, so you need to transfer it by JSON.parse
    let userData = JSON.parse(result.body);
    // console.log(userData) // fb user data
    sql = `SELECT * FROM user WHERE email = "${userData.email}"`;
    con.query(sql, function (err, result) {
      if (result.length === 1) {
        const token = jwt.sign(
          { userEmail: userData.email, exp: expirationDate },
          secret
        );
        sql = `UPDATE user SET access_token = "${token}", access_expired = "${signInDate}" WHERE email = "${userData.email}"`;
        con.query(sql, function (err) {
          if (err) throw err;

          sql = `SELECT number AS id, provider_id AS provider, name, email, picture FROM user WHERE email = "${userData.email}"`;

          con.query(sql, function (err, result) {
            if (err) throw err;
            let user = result[0];

            data = {};
            data.access_token = token;
            data.access_expired = signInDate;
            data.user = user;
            let results = {};
            results.data = data;
            res.json(results);
          });
        });
      } else if (result.length === 0) {
        const token = jwt.sign(
          { userEmail: userData.email, exp: expirationDate },
          secret
        );
        sql = `INSERT INTO user SET number = ?, name = ?, email = ?, picture = ?, provider_id = ?, access_token = ?, access_expired = ?`;

        con.query(
          sql,
          [
            userData.id,
            userData.name,
            userData.email,
            "123.jepg",
            2,
            token,
            signInDate,
          ],
          function (err, result) {
            if (err) throw err;

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
          }
        );
      } else {
        throw err;
      }
    });
  } catch (error) {
    res.send(err);
  }
};

const getUserProfile = async (req, res) => {
  const signInDate = Math.floor(Date.now() / 1000);
  decode = jwt.verify(req.body.token, secret)
  if (decode.exp > signInDate) {
    // console.log("沒過期");
    const sql = `SELECT number AS id, provider_id AS provider, name, email, picture FROM user WHERE email = "${decode.userEmail}" AND access_token = "${req.body.token}"`;
    con.query(sql, function (err, result) {
      if (err) { console.log(err) }
      if (result.length === 0) {
        res.status(404).json({ error: "email is not exist !" });
        return;
      } else {
        res.status(200).json(result[0]);
      }
    });
  } else {
    res.status(404).json({ error: "登入逾時，請重新登入" });
  }
};

module.exports = {
  signUp,
  signIn,
  fbSignIn,
  getUserProfile
};