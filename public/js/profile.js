async function checkUserLogIn() {
  try {
    const native_token = localStorage.getItem('userToken');
    const fb_token = localStorage.getItem('fbToken');
    if (!native_token && !fb_token) {
      alert('請先登入會員');
      window.location.replace('/login.html');
      return;
    }
    const token = new Object();
    if (native_token) {
      token['token'] = localStorage.getItem('userToken');
    } else if (fb_token) {
      token['token'] = localStorage.getItem('fbToken');
    }
    const login_url = 'api/1.0/user/profile';
    const login = await fetchDataByPost(login_url, token);
    if (login.error) {
      alert('登入逾時，請重新登入！');
      window.location.replace('/login.html');
    } else {
      renderUserInf(login);
    }
  } catch (error) {
    alert('伺服器有問題，請稍後再試！'); 
  }
}

function renderUserInf (data) {
  const name = document.getElementById('name');
  const email = document.getElementById('email');
  name.textContent = data.name;
  email.textContent= data.email;
}

function init() {
  checkUserLogIn();
  countCart();
}

document.addEventListener('DOMContentLoaded', init());