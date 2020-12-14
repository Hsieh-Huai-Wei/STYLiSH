function signUp() {
  const data = {
    "name": document.getElementById("signUpForm")[0].value,
    "email": document.getElementById("signUpForm")[1].value,
    "pwd": document.getElementById("signUpForm")[2].value,
  }
  fetch(`api/1.0/user/signup`, {
    method: 'POST',
    headers: new Headers({
      'Content-Type': 'application/json'
    }),
    body: JSON.stringify(data),
  }).then((res) => res.json())
    .then((body) => {
      console.log(body)
      const token = body.data.access_token
      localStorage.setItem('userToken', token);
      window.location.replace('/profile.html');
    });
};

function signIn() {
  const data = {
    "email": document.getElementById("signInForm")[0].value,
    "pwd": document.getElementById("signInForm")[1].value
  }
  fetch(`api/1.0/user/signin`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data),
  }).then((res) => res.json())
    .then((body) => {
      if (body.status !== undefined) {
        alert(body.msg);
      } else {
        const token = body.data.access_token
        localStorage.setItem('userToken', token);
        window.location.replace('/profile.html');
      }
    });
};

function statusChangeCallback(response) {
  if (response.status === "connected") {
    const body = {
      access_token: response.authResponse.accessToken,
    };
    fetch("api/1.0/fbsignin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })
      .then((res) => res.json())
      .then((body) => {
        const token = body.data.access_token
        localStorage.setItem('fbToken', token);
        window.location.replace('/profile.html');
      });
  } else {
    // Not logged into your webpage or we are unable to tell.
    // document.getElementById("status").innerHTML =
    //   "Please log " + "into this webpage.";
  }
}

function checkLoginState() {
  // Called when a person is finished with the Login Button.
  FB.getLoginStatus(function (response) {
    // See the onlogin handler
    statusChangeCallback(response);
  });
}

window.fbAsyncInit = function () {
  FB.init({
    appId: "273140227393740",
    cookie: true, // Enable cookies to allow the server to access the session.
    xfbml: true, // Parse social plugins on this webpage.
    version: "v7.0", // Use this Graph API version for this call.
  });

  FB.getLoginStatus(function (response) {
    // Called after the JS SDK has been initialized.
    statusChangeCallback(response); // Returns the login status.
  });
};

(function (d, s, id) {
  // Load the SDK asynchronously
  var js,
    fjs = d.getElementsByTagName(s)[0];
  if (d.getElementById(id)) return;
  js = d.createElement(s);
  js.id = id;
  js.src = "https://connect.facebook.net/en_US/sdk.js";
  fjs.parentNode.insertBefore(js, fjs);
})(document, "script", "facebook-jssdk");