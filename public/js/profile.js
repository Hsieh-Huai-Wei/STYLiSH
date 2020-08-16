if (localStorage.getItem("userToken")) {
  const data = {
    "token": localStorage.getItem("userToken")
  }
  fetch("api/1.0/user/profile", {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data),
  })
    .then((res) => res.json())
    .then((body) => {
      if (body.error) {
        alert("登入逾時，請重新登入")
        window.location.replace("/signup_signin.html");
      } else {
        const userName = body.name;
        const userEmail = body.email;
        const p = document.getElementById('response');
        p.textContent = `Name: ${userName} / Email: ${userEmail}`;
      }
    });
} else if (localStorage.getItem("fbToken")) {
  const data = {
    "token": localStorage.getItem("fbToken")
  }
  fetch("api/1.0/user/profile", {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data),
  })
    .then((res) => res.json())
    .then((body) => {
      // console.log(body)
      if (body.error) {
        // alert(body.error);
        alert("登入逾時，請重新登入")
        window.location.replace("/signup_signin.html");
      } else {
        const userName = body.name;
        const userEmail = body.email;
        const p = document.getElementById('response');
        p.textContent = `Name: ${userName} / Email: ${userEmail}`;
      }
    });
} else {
  alert("請先登入會員");
  window.location.replace("/signup_signin.html");
}