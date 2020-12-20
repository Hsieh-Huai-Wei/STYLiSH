function checkCart() {
  const cart_list = document.getElementById('list');
  const cart_str = localStorage.getItem('userCart');
  if (!cart_str) {
    cart_list.innerHTML="<h4 style='margin-left:20px;'>購物車空空的耶</h4>";
  } else {
    const cart = JSON.parse(cart_str);
    if (cart.length === 0) {
      cart_list.innerHTML="<h4 style='margin-left:20px;'>購物車空空的耶</h4>";
      return;
    }
    for(let i=0; i<cart.length; i++){
      let data=cart[i];
      const total_price = data.count*data.price
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
}

function deleteProduct(pos) {
  const cart_str = localStorage.getItem('userCart');
  const cart = JSON.parse(cart_str);
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

checkUserLogIn();

function countCart() {
  const cart_str = localStorage.getItem('userCart');
  const cart = JSON.parse(cart_str);
  const cart_count = document.getElementById('cart-qty');
  cart_count.textContent = cart.length;
}

countCart()