let payment = 'credit_card';
let recipient_time = 'anytime';
const credit_card_payment_inf = document.getElementById("payment");
const shipping = document.getElementById("shipping");
shipping.addEventListener("change", ()=>{
  if (shipping.value === 'credit_card') {
    payment = 'credit_card';
    credit_card_payment_inf.classList.remove('hidden_credit')
  } else {
    payment = 'cash_on_delivery';
    credit_card_payment_inf.classList.add('hidden_credit')
  }
})

TPDirect.setupSDK(
  12348,
  "app_pa1pQcKoY22IlnSXq5m5WP5jFKzoRG58VEXpT7wU62ud7mMbDOGzCYIlzzLF",
  "sandbox"
);

TPDirect.card.setup({
  fields: {
    list: "#list",
    number: {
      // css selector
      element: "#card-number",
      placeholder: "**** **** **** ****",
    },
    expirationDate: {
      // DOM object
      element: document.getElementById("card-expiration-date"),
      placeholder: "MM / YY",
    },
    ccv: {
      element: "#card-ccv",
      placeholder: "後三碼",
    },
  },
  styles: {
    input: {
      color: "gray",
    },
    ".valid": {
      color: "green",
    },
    ".invalid": {
      color: "red",
    },
    "@media screen and (max-width: 400px)": {
      input: {
        color: "orange",
      },
    },
  },
});

function checkCart() {
  const cart_list = document.getElementById('list');
  const cart = getCartProduct();
  if (cart.msg) {
    cart_list.innerHTML=`<h4 style='margin-left:20px;'>${cart.msg}</h4>`;
    return;
  }
  for(let i=0; i<cart.length; i++){
    let data=cart[i];
    const total_price = data.count*data.price;
    cart_list.innerHTML += `
      <div class="row cart-list">
        <div class="detail">
          <img src="${data.main_image}" alt="">
          <div class="product_inf">
            <div class="title">${data.title}</div>
            <div class="color"><div class="choice-color" style="background-color: #${data.color_code}"></div></div>
            <div class="size">${data.size}</div>
          </div>
        </div>
        <div class="pay_inf">
          <div class="count">${data.count}</div>
          <div class="single_price">NTD. ${data.price}</div>
          <div class="total_price">NTD. ${total_price}</div>
          <img class="delete" src="./imgs/delete.png" alt="" onclick="deleteProduct(${i})">
        </div>
      </div>
    `;
  }
}

function deleteProduct(pos) {
  const cart = getCartProduct();
  const list = document.getElementById('list');
  const div = document.createElement("div");
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
}

function checkUserLogIn () {
  if (localStorage.getItem("userToken") || localStorage.getItem("fbToken")) {
    let data = new Object();
    if (localStorage.getItem("userToken")) {
      data = {
        "token": localStorage.getItem("userToken")
      }
    } else {
      data = {
        "token": localStorage.getItem("fbToken")
      }
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
          window.location.replace("/login.html");
        } else {
          checkCart();
        }
      });
  } else {
    alert("請先登入會員");
    window.location.replace("/login.html");
  }
}

function countCart() {
  const cart = getCartProduct();
  const cart_count = document.getElementById('cart-qty');
  if (cart) {
    cart_count.textContent = cart.length;
  }
}

function getPrime() {
  return new Promise((resolve)=>{
    const tappaySataus = TPDirect.card.getTappayFieldsStatus();
    const error_msg = {
      msg: '信用卡付款失敗，請確認信用卡資訊是否填寫正確！',
    }
    if (tappaySataus.canGetPrime === false) return error_msg;
    TPDirect.card.getPrime((result)=>{
      if (result.status === 0) resolve(result.card.prime);
      resolve(error_msg);
    });
  })
}

function choiceTime(time) {
  recipient_time = time;
}

async function checkPaymentInf () {
  const cart = getCartProduct();
  const recipient_name = document.getElementById("recipient-name").value;
  const recipient_email = document.getElementById("recipient-email").value;
  const recipient_phone = document.getElementById("recipient-phone").value;
  const recipient_address = document.getElementById("recipient-address").value;
  const locations = document.getElementById("location").value;
  if (!recipient_name || !recipient_email || !recipient_phone || !recipient_address) return alert('收件資料不完成，請填寫收件資料！');
  let prime = '';
  if (payment === 'credit_card') prime = await getPrime();
  console.log(prime)
  if (prime.msg) {
    alert(prime.msg)
    return window.location.replace("/cart.html");
  }
  const body = {
    prime: prime,
    total_price: 130,
    location: locations,
    shipping: payment,
    recipient_name: recipient_name,
    recipient_email: recipient_email,
    recipient_phone: recipient_phone,
    recipient_address: recipient_address,
    recipient_time: recipient_time,
    cart: cart,
  }
  fetch("api/1.0/order/checkout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  })
    .then((res) => { res.json })
    .then((body)=>{
      return window.location.replace("/thankyou.html");
  })
}

function getCartProduct() {
  const cart_str = localStorage.getItem('userCart');
  const cart = JSON.parse(cart_str);
  if (!cart_str || cart.length === 0) {
    return { msg: '購物車空空的耶！'}
  }
  return cart;
}

function countTotal() {
  const cart_str = localStorage.getItem('userCart');
  const cart = JSON.parse(cart_str);
  const subtotal = document.getElementById('subtotal');
  const total_price = document.getElementById('total');
  let price = 0;
  for (let i=0; i<cart.length; i++) {
    price += Number(cart[i].count)*Number(cart[i].price);
  };
  subtotal.innerHTML = price;
  total_price.innerText = price + 60;
}

checkUserLogIn();
countCart()
countTotal();