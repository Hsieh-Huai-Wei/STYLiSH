async function fetchDataByPost(url, data) {
  const res_json = await fetch(url, {
    method: 'POST',
    body: JSON.stringify(data),
    headers: new Headers({
      'Content-Type': 'application/json'
    })
  });
  return res_json.json();
}

async function checkUserLogIn() {
  try {
    const native_token = localStorage.getItem('userToken');
    const fb_token = localStorage.getItem('fbToken');
    if (!native_token || !fb_token) {
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
    console.log(error.msg);
    alert(error.msg);
  }
}

function renderUserInf (data) {
  const name = document.getElementById('name');
  const email = document.getElementById('email');
  name.textContent = data.name;
  email.textContent= data.email;
}

function countCart() {
  const cart_str = localStorage.getItem('userCart');
  if (cart_str) {
    const cart = JSON.parse(cart_str);
    const cart_count = document.getElementById('cart-qty');
    cart_count.textContent = cart.length;
  }
}

function init() {
  checkUserLogIn();
  countCart();
}

document.addEventListener('DOMContentLoaded', init());