function init() {
  const number = document.getElementById('number');
  const order_num = localStorage.getItem('orderNum');
  number.textContent = order_num;
  localStorage.removeItem('userCart');
}

document.addEventListener('DOMContentLoaded', init());