async function fetchDataByGet(url) {
  const res_json = await fetch(url, {
    method: 'GET',
    headers: new Headers({
      'Content-Type': 'application/json'
    })
  });
  return res_json.json();
}

function fetchDataByPost(url, data) {
  const res_json = fetch(url, {
    method: 'POST',
    body: JSON.stringify(data),
    headers: new Headers({
      'Content-Type': 'application/json'
    })
  });
  return res_json.json();
}

const product_detail = new Object();
const mainImage = document.createElement('div');
const product_name = document.createElement('div');
const id = document.createElement('div');
const price = document.createElement('div');
const img = document.createElement('img');
const view = document.querySelector('#viewM');
const details = document.querySelector('.details');
const colors = document.querySelector('.colors');
const titleC = document.querySelector('#titleC');
const colorBox = document.querySelector('.colorBox');
const titleS = document.querySelector('#titleS');
const sizeBox = document.querySelector('.sizeBox');
const summary = document.querySelector('.summary');
const story = document.querySelector('.story');
const images = document.querySelector('.images');
const btnAdd = document.createElement('button');
const btnSub = document.createElement('button');
const stockNum = document.createElement('input');
const qty = document.querySelector('#product-qty');
const cart = document.querySelector('.add-cart');

colorBox.addEventListener('click', (event) => {
  const color = document.querySelectorAll('.color');
  if (event.target.getAttribute('code') !== null) {
    // color reset
    color.forEach(item => item.className = 'color');

    // setting preventObj
    event.target.className = 'color current';
    currentColor = event.target.getAttribute('code');
    preventObj.color_code = currentColor;
    
    // check
    checkSize();
  }
});

sizeBox.addEventListener('click', (event) => {
  const size = document.querySelectorAll('.size');
  if (event.target.getAttribute('code') !== null && event.target.getAttribute('class') !== 'size disabled') {
    // size reset
    size.forEach(item => item.className = 'size');

    // setting preventObj
    event.target.className = 'size current';
    currentSize = event.target.getAttribute('code');
    preventObj.size = currentSize;

    // check
    checkSize();
  }
});

qty.addEventListener('click', (event) => {
  const stock = preventObj.stock;
  const cal = document.querySelector('.value');
  if (stock !== 0) {
    if (event.target.className === 'add') {
      if (Number(cal.value) < stock) {
        cal.value = parseInt(cal.value) + 1;
      } else {
        cal.value = stock;
      }
    } else if (event.target.className === 'sub') {
      if (Number(cal.value) === 1) {
        cal.value = 1
      } else if (Number(cal.value) > stock) {
        cal.value = stock;
      } else {
        cal.value = parseInt(cal.value) - 1;
      }
    }
  } else {
    cal.value = 0;
  }
});

cart.addEventListener('click', () => {
  const purchase = product_detail;
  const addProduct = {
    product_id: purchase.data.id,
    title: purchase.data.title,
    price: parseInt(purchase.data.price.split('.')[1]),
    main_image: purchase.data.main_image,
    color_code: preventObj.color_code,
    size: preventObj.size,
    count: document.querySelector('.value').value
  }
  if (localStorage.getItem('userCart')) {
    const cartList_str = localStorage.getItem('userCart');
    const cartList = JSON.parse(cartList_str);
    const new_cartList = checkCartList(cartList, addProduct);
    localStorage.setItem('userCart', JSON.stringify(new_cartList));
  } else {
    const insertCart = [addProduct];
    localStorage.setItem('userCart', JSON.stringify(insertCart));
  };
  countCart();
  alert('已成功加入購物車！')
});

function renderSize() {
  const variants =  product_detail.data.variants;
  // disabled size
  const size_box = document.getElementsByClassName('size');
  Array.from(size_box).forEach(size => {
    size.setAttribute("class", "size disabled");
  });

  // find enabled size
  const size_arr = [];
  variants.forEach(variant => {
    if (variant.color_code === preventObj.color_code) size_arr.push(variant.size);
  });

  // display exist size
  Array.from(size_box).forEach(size => {
    size_arr.find(item => {
      if (item === size.innerHTML) return size.setAttribute('class', 'size');
    });
  });
  return size_arr;
}

function checkSize() {
  const size_arr = renderSize();
  const size = size_arr.find(item => item === preventObj.size);
  checkStock(size);
}

function checkStock(size) {
  const variants =  product_detail.data.variants;
  const sizeDiv = document.querySelectorAll('.size');
  if (size) {
    const stock = variants.find((item) => {
      if (item.color_code === preventObj.color_code && item.size === preventObj.size) {
        return item.stock;
      }
    })
    preventObj.stock = stock.stock;
  } else {
    const size = variants.find((item) => {
      if (item.color_code === preventObj.color_code) {
        return item.size;
      }
    })
    preventObj.size = size.size;
  }
  sizeDiv.forEach(size => {
    if (size.getAttribute('value') === preventObj.size) {
      size.setAttribute('class', 'size current');
    }
  })
}

function checkCartList(cartList, addProduct) {
  cartList.forEach(item => {
    if (item.product_id === addProduct.product_id && item.size === addProduct.size && item.color_code === addProduct.color_code) {
      const new_count = Number(item.count) + Number(addProduct.count);
      item.count = new_count;
      item.price = addProduct.price;
    }
  })
  cartList.push(addProduct);
  return cartList;
}

async function getProduct() {
  try {
    const url = new URLSearchParams(window.location.search);
    const id = url.get('id');
    const product_url = `api/1.0/products/details?id=${id}`;
    const product = await fetchDataByGet(product_url)
    localStorage.setItem('productData', JSON.stringify(product));
    product_detail = product;
    return product;
  } catch (error) {
    console.log(error)
  }
}

function renderProduct() {
  return new Promise((resolve) => {
    mainImage.setAttribute('id', 'product-main-image');
    mainImage.className = 'name';
    img.src = `${product_detail.data.main_image}`;
    mainImage.appendChild(img);
    view.prepend(mainImage);

    // product image, title, number, price
    product_name.setAttribute('id', 'product-name');
    product_name.className = 'name';
    product_name.innerHTML = `${product_detail.data.title}`;
    id.setAttribute('id', 'product-id');
    id.className = 'id';
    id.innerHTML = `${product_detail.data.id}`;
    price.setAttribute('id', 'product-price');
    price.className = 'price';
    price.innerHTML = `${product_detail.data.price}`;
    details.prepend(price);
    details.prepend(id);
    details.prepend(product_name);

    // render color
    for (let j = 0; j < product_detail.data.colors.length; j++) {
      const color = document.createElement('div');
      color.className = 'color';
      color.name = `#${product_detail.data.colors[j]}`;
      color.style.backgroundColor = `#${product_detail.data.colors[j].code}`;
      color.setAttribute('code', `${product_detail.data.colors[j].code}`);
      color.setAttribute('value', `${product_detail.data.colors[j].code}`);
      colorBox.appendChild(color);
    }

    // render size
    for (let j = 0; j < product_detail.data.sizes.length; j++) {
      const size = document.createElement('div');
      size.className = 'size';
      size.name = `#${product_detail.data.sizes[j]}`;
      size.innerHTML = `${product_detail.data.sizes[j]}`;
      size.style.backgroundColor = `#${product_detail.data.sizes[j]}`;
      size.setAttribute('code', `${product_detail.data.sizes[j]}`);
      size.setAttribute('value', `${product_detail.data.sizes[j]}`);
      sizeBox.appendChild(size);
    }

    // render stock
    btnAdd.className = 'add';
    btnAdd.innerHTML = '+';
    btnSub.className = 'sub';
    btnSub.innerHTML = '-';
    stockNum.className = 'value';
    stockNum.setAttribute('value', 0);
    stockNum.setAttribute('disabled', 'disabled');
    qty.prepend(btnAdd);
    qty.prepend(stockNum);
    qty.prepend(btnSub);

    // product summary
    let summary1 = `${product_detail.data.note}<br><br>`;
    let texture = `${product_detail.data.texture}`.split('/');
    summary2 = '';
    for (let i = 0; i < texture.length; i++) {
      summary2 += texture[i] + '<br>';
    }
    let summary3 = `<br>清洗：${product_detail.data.wash}<br>產地：${product_detail.data.place}`;
    summary.innerHTML = summary1 + summary2 + summary3;

    // product story
    story.innerHTML = `${product_detail.data.description}`;

    // product images
    for (let j = 0; j < product_detail.data.images.length; j++) {
      const img = document.createElement('img');
      img.src = `${product_detail.data.images[j]}`;
      images.appendChild(img);
    }
    resolve();
  })
}

function currentRender(data) {
  return new Promise ((resolve) => {
    renderSize();
    const color = document.querySelectorAll('.color');
    const size = document.querySelectorAll('.size');
    color.forEach(item => {
      if (item.getAttribute('value') === data.color_code) {
        item.setAttribute('class', 'color current');
        return;
      };
    });
    size.forEach(item => {
      if (item.getAttribute('value') === data.size) {
        item.setAttribute('class', 'size current');
        return;
      };
    });
    resolve();
  })
}

function countCart() {
  const cart_str = localStorage.getItem('userCart');
  if (cart_str) {
    const cart = JSON.parse(cart_str);
    const cart_count = document.getElementById('cart-qty');
    cart_count.textContent = cart.length;
  }
}

async function init() {
  await getProduct();
  await renderProduct();
  const variants = product_detail.data.variants;
  preventObj.color_code = document.getElementsByClassName('color')[0].getAttribute('value')
  variants.forEach(variant => {
    if (variant.color_code === preventObj.color_code) {
      preventObj.size = variant.size;
      preventObj.stock = variant.stock;
    }
  })
  if (preventObj.stock !== 0) {
    document.querySelector('.value').value = 1;
  } else {
    document.querySelector('.value').value = 0;
  }
  await currentRender(preventObj, variants);
  countCart();
}

document.addEventListener('DOMContentLoaded', init())