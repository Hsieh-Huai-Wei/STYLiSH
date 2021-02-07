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

function insertCartList(products_stock, cart_list) {
  for (let i=0; i< cart_list.length ;i++) {
    const total_price = Number(cart_list[i].count)*Number(cart_list[i].price);
    let count = '';
    for (let j=1 ; j<products_stock.data[i].stock+1; j++) {
      if (j === Number(cart_list[i].count)) {
        count += `<option value="${j}" selected>${j}</option>`
      } else {
        count += `<option value="${j}">${j}</option>`
      }
    };
    show_list.innerHTML += `
      <div class='row cart-list'>
      <div class='detail'>
        <img src='${cart_list[i].main_image}' alt=''>
        <div class='product_inf'>
          <div class='title'>${cart_list[i].title}</div>
          <div class='color'><div class='choice-color' style='background-color: #${cart_list[i].color_code}'></div></div>
          <div class='size'>${cart_list[i].size}</div>
        </div>
      </div>
      <div class='pay_inf'>
        <select id='cart_stock${i}' class='count' value=${cart_list[i].count} onchange='changeStock(${i})'>
        ${count}
        </select>
          <div class='single_price'>NTD. ${cart_list[i].price}</div>
          <div id='total_price${i}' class='total_price'>NTD. ${total_price}</div>
          <img class='delete' src='./imgs/delete.png' alt='' onclick='deleteProduct(${i})'>
        </div>
      </div>
    `;
  }
}

function changeStock(index) {
  const cart_index = document.querySelector(`#cart_stock${index}`);
  const total = document.querySelector(`#total_price${index}`);
  const cart_list = countCart();
  cart_list[index].count = cart_index.value;
  total.innerHTML = 'NTD. ' + Number(cart_list[index].count)*Number(cart_list[index].price)
  localStorage.setItem('userCart', JSON.stringify(cart_list));
  countTotal(cart_list);
}

function deleteProduct(pos) {
  const cart_list = countCart();
  cart_list.splice(pos,1);
  localStorage.setItem('userCart', JSON.stringify(cart_list));
  show_list.innerHTML = '';
  checkCart()
};

function choiceTime (time) {
  recipient_time = time;
};

async function checkPaymentInf() {
  try {
    const cart = countCart();
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
    if (payment_status.error) return alert(payment_status.error);
    localStorage.setItem('orderNum', payment_status.data.number);
    window.location.replace('/thankyou.html');
  } catch (error) {
    alert(error.error)
    console.error(error);
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
        return;
      }
    } else {
      alert('請先登入會員');
      window.location.replace('/login.html');
      return;
    }
  } catch (error) {
    console.error(error);
  }
}

const subtotal = document.getElementById('subtotal');
const total_price = document.getElementById('total');

function countTotal(cart_list) {
  let price = 0;
  cart_list.forEach(cart => {
    price += Number(cart.count) * Number(cart.price);
  });
  subtotal.innerHTML = price;
  total_price.innerText = price + 60;
}

async function init() {
  await checkUserLogIn();
  checkCart()
}

document.addEventListener('DOMContentLoaded', init());

const show_list = document.getElementById('list');

async function renderCartList(cart_list) {
  const stocks_url = '/api/1.0/products/stock';
  const products_stock = await fetchDataByPost(stocks_url, cart_list);
  insertCartList(products_stock, cart_list)
  countTotal(cart_list);
}

function checkCart() {
  const cart_list = countCart();
  if (!cart_list || !cart_list.length || cart_list.length === 0) {
    show_list.innerHTML=`<h4 style='margin-left:20px;'>購物車空空的耶！</h4>`;
    return;
  };
  renderCartList(cart_list);
}