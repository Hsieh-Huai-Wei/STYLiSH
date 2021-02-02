/* global TPDirect */

const credit_card_payment_inf = document.getElementById('payment');
const shipping = document.getElementById('shipping');
let payment = 'credit_card';
let recipient_time = 'anytime';

// Tap pay setting
TPDirect.setupSDK(12348, 'app_pa1pQcKoY22IlnSXq5m5WP5jFKzoRG58VEXpT7wU62ud7mMbDOGzCYIlzzLF', 'sandbox');
TPDirect.card.setup({
  fields: {
    list: '#list',
    number: {
      // css selector
      element: '#card-number',
      placeholder: '**** **** **** ****',
    },
    expirationDate: {
      // DOM object
      element: document.getElementById('card-expiration-date'),
      placeholder: 'MM / YY',
    },
    ccv: {
      element: '#card-ccv',
      placeholder: '後三碼',
    },
  },
  styles: {
    input: {
      color: 'gray',
    },
    '.valid': {
      color: 'green',
    },
    '.invalid': {
      color: 'red',
    },
    '@media screen and (max-width: 400px)': {
      input: {
        color: 'orange',
      },
    },
  },
});
shipping.addEventListener('change', ()=>{
  if (shipping.value === 'credit_card') {
    payment = 'credit_card';
    credit_card_payment_inf.classList.remove('hidden_credit');
  } else {
    payment = 'cash_on_delivery';
    credit_card_payment_inf.classList.add('hidden_credit');
  }
});

function getPrime() {
  return new Promise((resolve, reject) => {
    const tappaySataus = TPDirect.card.getTappayFieldsStatus();
    const error_msg = {
      error: '信用卡付款失敗，請確認信用卡資訊是否填寫正確！',
    };
    if (!tappaySataus.canGetPrime) reject(error_msg);
    TPDirect.card.getPrime((result)=>{
      if (result.status === 0) resolve(result.card.prime);
      reject(error_msg);
    });
  });
}

async function checkCart() {
  const cart_list = document.getElementById('list');
  const cart = getCartProduct();
  if (cart.msg) {
    cart_list.innerHTML=`<h4 style='margin-left:20px;'>${cart.msg}</h4>`;
    return;
  };
  const user_need = new Array();
  cart.forEach(product => {
    const product_inf = {
      number: product.product_id,
      size: product.size,
      color: product.color_code
    };
    user_need.push(product_inf);
  })
  const stocks_url = '/api/1.0/products/stock';
  const products_stock = await fetchDataByPost(stocks_url, user_need);
  for (let i=0; i< cart.length ;i++) {
    const total_price = cart[i].count*cart[i].price;
    let count = '';
    for (let j=1 ; j<products_stock.data[i].stock+1; j++) {
      if (j === Number(cart[i].count)) {
        count += `<option value="${j}" selected>${j}</option>`
      } else {
        count += `<option value="${j}">${j}</option>`
      }
    };
    cart_list.innerHTML += `
      <div class='row cart-list'>
      <div class='detail'>
        <img src='${cart[i].main_image}' alt=''>
        <div class='product_inf'>
          <div class='title'>${cart[i].title}</div>
          <div class='color'><div class='choice-color' style='background-color: #${cart[i].color_code}'></div></div>
          <div class='size'>${cart[i].size}</div>
        </div>
      </div>
      <div class='pay_inf'>
        <select class='count' value=${cart[i].count}>
        ${count}
        </select>
          <div class='single_price'>NTD. ${cart[i].price}</div>
          <div class='total_price'>NTD. ${total_price}</div>
          <img class='delete' src='./imgs/delete.png' alt='' onclick='deleteProduct(${i})'>
        </div>
      </div>
    `;
  }
}

function deleteProduct (pos) {
  const cart = getCartProduct();
  const list = document.getElementById('list');
  const div = document.createElement('div');
  const cart_html = document.getElementById('cart');
  cart.splice(pos,1);
  localStorage.setItem('userCart', JSON.stringify(cart));
  list.remove();
  div.setAttribute('id', 'list');
  div.setAttribute('class', 'list');
  cart_html.appendChild(div);
  countCart();
  checkCart();
  countTotal();
};

function choiceTime (time) {
  recipient_time = time;
};

function getCartProduct() {
  const cart_str = localStorage.getItem('userCart');
  const cart = JSON.parse(cart_str);
  if (!cart_str || cart.length === 0) {
    return { msg: '購物車空空的耶！'};
  }
  return cart;
}

async function checkPaymentInf() {
  try {
    const cart = getCartProduct();
    const recipient_name = document.getElementById('recipient-name').value;
    const recipient_phone = document.getElementById('recipient-phone').value;
    const recipient_address = document.getElementById('recipient-address').value;
    const locations = document.getElementById('location').value;
    if (!recipient_name || !recipient_phone || !recipient_address) return alert('收件資料不完成，請填寫收件資料！');
    const payment_inf = {
      total_price: 130,
      location: locations,
      shipping: payment,
      recipient_name: recipient_name,
      recipient_phone: recipient_phone,
      recipient_address: recipient_address,
      recipient_time: recipient_time,
      cart: cart,
    };
    if (localStorage.getItem('userToken')) {
      payment_inf.token = localStorage.getItem('userToken');
    } else if (localStorage.getItem('fbToken')) {
      payment_inf.token = localStorage.getItem('fbToken');
    }
    const cart_str = localStorage.getItem('userCart');
    const cart_list = JSON.parse(cart_str);
    if (!cart_str || cart_list.length === 0) return alert('請選取產品加入購物車，才可進行結帳！');
    let prime = '';
    if (payment === 'credit_card') {
      prime = await getPrime();
      if (prime.error) {
        alert(prime.error);
        return window.location.replace('/cart.html');
      };
      payment_inf.prime = prime;
    }
    const payment_url = 'api/1.0/order/checkout';
    const payment_status = await fetchDataByPost(payment_url, payment_inf);
    if (payment_status.error) throw new Error();
    localStorage.setItem('orderNum', payment_status.data.number);
    window.location.replace('/thankyou.html');
  } catch (error) {
    alert('伺服器有問題，請稍後再試！'); 
  }
};

async function checkUserLogIn() {
  try {
    if (localStorage.getItem('userToken') || localStorage.getItem('fbToken')) {
      const token = new Object();
      if (localStorage.getItem('userToken')) {
        token['token'] = localStorage.getItem('userToken');
      } else {
        token['token'] = localStorage.getItem('fbToken');
      }
      const profile_url = 'api/1.0/user/profile';
      const profile = await fetchDataByPost(profile_url, token);
      if (profile.error) {
        alert('登入逾時，請重新登入');
        window.location.replace('/login.html');
      } else {
        checkCart();
      }
    } else {
      alert('請先登入會員');
      window.location.replace('/login.html');
    }
  } catch (error) {
    alert('伺服器有問題，請稍後再試！'); 
  }
}

function countTotal(cart_list) {
  const subtotal = document.getElementById('subtotal');
  const total_price = document.getElementById('total');
  let price = 0;
  cart_list.forEach(cart => {
    price += Number(cart.count) * Number(cart.price);
  });
  subtotal.innerHTML = price;
  total_price.innerText = price + 60;
}

async function init() {
  checkUserLogIn();
  const cart = countCart();
  if (cart.length > 0) {
    countTotal(cart);
  }
}

document.addEventListener('DOMContentLoaded', init());