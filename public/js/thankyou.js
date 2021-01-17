function getUserData() {
  const user = document.getElementById('response');
  const order = document.getElementById('order');
  user.textContent = `親愛的顧客,`;
  order.textContent = `訂單已完成，謝謝您的惠顧！`;;
}

getUserData();