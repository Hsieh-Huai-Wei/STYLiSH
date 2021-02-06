/* global app, FB */
(function (d, s, id) {
  // Load the SDK asynchronously
  const fjs = d.getElementsByTagName(s)[0];
  if (d.getElementById(id)) return;
  const js = d.createElement(s);
  js.id = id;
  js.src = 'https://connect.facebook.net/en_US/sdk.js';
  fjs.parentNode.insertBefore(js, fjs);
})(document, 'script', 'facebook-jssdk');

function checkLoginState() {
  // Called when a person is finished with the Login Button.
  FB.getLoginStatus(function (response) {
    // See the onlogin handler
    statusChangeCallback(response);
  });
};

window.fbAsyncInit = function () {
  FB.init({
    appId: '273140227393740',
    cookie: true, // Enable cookies to allow the server to access the session.
    xfbml: true, // Parse social plugins on this webpage.
    version: 'v7.0', // Use this Graph API version for this call.
  });

  FB.getLoginStatus(function (response) {
    // Called after the JS SDK has been initialized.
    statusChangeCallback(response); // Returns the login status.
  });
};

async function statusChangeCallback(response) {
  try {
    if (response.status === 'connected') {
      const old_token = {
        access_token: response.authResponse.accessToken,
      };
      const login_url = 'api/1.0/fbsignin';
      const log_in = await fetchDataByPost(login_url, old_token);
      if (log_in.error) return alert(log_in.error);
      const new_token = log_in.data.access_token;
      localStorage.setItem('fbToken', new_token);
      window.location.replace('/profile.html');
    } else {
      alert ('請登入會員！');
    }
  } catch (error) {
    console.error(error);
  }
}

async function signIn() {
  try {
    const user_inf = {
      'email': document.getElementById('email').value,
      'pwd': document.getElementById('pwd').value,
    };
    const sign_url = 'api/1.0/user/signin';
    const sign_in = await fetchDataByPost(sign_url, user_inf);
    if (sign_in.error) return alert(sign_in.error);
    const token = sign_in.data.access_token;
    localStorage.setItem('userToken', token);
    window.location.replace('/profile.html');
  } catch (error) {
    console.error(error);
  }
};

function init() {
  countCart()
}

document.addEventListener('DOMContentLoaded', init());