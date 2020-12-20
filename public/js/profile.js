if (localStorage.getItem('userToken')) {
  const data = {
    'token': localStorage.getItem('userToken')
  }
  fetch('api/1.0/user/profile', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data),
  })
    .then((res) => res.json())
    .then((body) => {
      if (body.error) {
        alert('登入逾時，請重新登入！')
        window.location.replace('/login.html');
      } else {
        renderUserInf(body);
      }
    });
} else if (localStorage.getItem('fbToken')) {
  const data = {
    'token': localStorage.getItem('fbToken')
  }
  fetch('api/1.0/user/profile', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data),
  })
    .then((res) => res.json())
    .then((body) => {
      if (body.error) {
        alert('登入逾時，請重新登入')
        window.location.replace('/login.html');
      } else {
        renderUserInf(body);
      }
    });
} else {
  alert('請先登入會員');
  window.location.replace('/login.html');
}

function renderUserInf (data) {
  console.log(data)
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

countCart()