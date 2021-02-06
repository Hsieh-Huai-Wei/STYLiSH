function countCart() {
  const cart_str = localStorage.getItem('userCart');
  if (cart_str) {
    const cart = JSON.parse(cart_str);
    const cart_count = document.getElementById('cart-qty');
    cart_count.textContent = cart.length;
  };
  return JSON.parse(cart_str);
}

async function fetchDataByGet(url) {
  const res_json = await fetch(url, {
    method: 'GET',
    headers: new Headers({
      'Content-Type': 'application/json'
    })
  });
  return res_json.json();
}

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