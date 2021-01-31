const { query } = require('../../util/dbcon');

const checkSignUp = async (data) => {
  return await query('SELECT * FROM user WHERE email = ?', [data]);
};

const signUp = async (data) => {
  return await query('INSERT INTO user SET ?',[data]);
};

const checkSignIn = async (userEmail, userPwd) => {
  return await query('SELECT * FROM user WHERE email = ? AND password = ?',[userEmail, userPwd]);
};

const signIn = async (token, signInDate, userEmail) => {
  return await query('UPDATE user SET access_token = ?, access_expired = ? WHERE email = ?',[token, signInDate, userEmail]);
};

const signInData = async (userEmail) => {
  return await query('SELECT number AS id, provider_id AS provider, name, email, picture FROM user WHERE email = ?',[userEmail]);
};

const getUserProfile = async (email, token) => {
  return await query('SELECT number AS id, provider_id AS provider, name, email, picture FROM user WHERE email = ? AND access_token = ? ;', [email, token]);
};

const getUserID = async (email, token) => {
  return await query('SELECT id FROM user WHERE email = ? ;', [email]);
};

module.exports = {
  checkSignUp,
  signUp,
  checkSignIn,
  signIn,
  signInData,
  getUserProfile,
  getUserID
};