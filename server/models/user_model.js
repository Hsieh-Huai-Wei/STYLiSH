const { query } = require("../../util/dbcon");

const checkSignUp = async (data) => {
  const result = await query("SELECT * FROM user WHERE email = ?", [data]);
  return result;
}

const signUp = async (data) => {
  try {
    const result = await query("INSERT INTO user SET number = ?, name = ?, email = ?, password = ?, picture = ?, provider_id = ?, access_token = ?, access_expired = ?",[data.number,
      data.name,
      data.email,
      data.password,
      data.picture,
      data.provider_id,
      data.access_token,
      data.access_expired])
    return result;
  } catch (err) {
    return {err};
  }
};

const checkSignIn = async (userEmail, userPwd) => {
  console.log(userEmail, userPwd)
  const result = await query('SELECT * FROM user WHERE email = ? AND password = ?',[userEmail, userPwd]);
  console.log(result)
  return result;
};

const signIn = async (token, signInDate, userEmail) => {
  const result = await query('UPDATE user SET access_token = ?, access_expired = ? WHERE email = ?',[token, signInDate, userEmail]);
  return result;
};

const signInData = async (userEmail) => {
  const result = await query('SELECT number AS id, provider_id AS provider, name, email, picture FROM user WHERE email = ?',[userEmail]);
  return result;
};

const getUserProfile = async (email, token) => {
  const result = await query('SELECT number AS id, provider_id AS provider, name, email, picture FROM user WHERE email = ? AND access_token = ? ;', [email, token]);
  return result;
};

module.exports = {
  checkSignUp,
  signUp,
  checkSignIn,
  signIn,
  signInData,
  getUserProfile
};