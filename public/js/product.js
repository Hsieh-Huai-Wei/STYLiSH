let product_detail = new Object();
const mainImage = document.createElement('div');
const product_name = document.createElement('div');
const id = document.createElement('div');
const price = document.createElement('div');
const img = document.createElement('img');
const view = document.querySelector('#viewM');
const details = document.querySelector('.details');
const colorBox = document.querySelector('.colorBox');
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
    color.forEach(item => item.className = 'color');
    event.target.className = 'color current';
    product_detail.color_code = event.target.getAttribute('code');
    checkSize();
  }
});

sizeBox.addEventListener('click', (event) => {
  const size = document.querySelectorAll('.size');
  if (event.target.getAttribute('code') !== null && event.target.getAttribute('class') !== 'size disabled') {
    size.forEach(item => item.className = 'size');
    event.target.className = 'size current';
    product_detail.size = event.target.getAttribute('code');
    checkSize();
  }
});

qty.addEventListener('click', (event) => {
  const stock = product_detail.stock;
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
        cal.value = 1;
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
    color_code: product_detail.color_code,
    size: product_detail.size,
    count: document.querySelector('.value').value
  };
  if (localStorage.getItem('userCart')) {
    const cartList_str = localStorage.getItem('userCart');
    const cartList = JSON.parse(cartList_str);
    const new_cartList = checkCartList(cartList, addProduct);
    localStorage.setItem('userCart', JSON.stringify(new_cartList));
  } else {
    const insertCart = [addProduct];
    localStorage.setItem('userCart', JSON.stringify(insertCart));
  }
  countCart();
  alert('已成功加入購物車！');
});

async function fetchDataByGet(url) {
  const res_json = await fetch(url, {
    method: 'GET',
    headers: new Headers({
      'Content-Type': 'application/json'
    })
  });
  return res_json.json();
}

function renderSize() {
  const variants =  product_detail.data.variants;
  const size_box = document.getElementsByClassName('size');
  Array.from(size_box).forEach(size => {
    size.setAttribute('class', 'size disabled');
  });
  const size_arr = new Array();
  variants.forEach(variant => {
    if (variant.color_code === product_detail.color_code) size_arr.push(variant.size);
  });
  Array.from(size_box).forEach(size => {
    size_arr.find(item => {
      if (item === size.innerHTML) return size.setAttribute('class', 'size');
    });
  });
  return size_arr;
}

function checkSize() {
  const size_arr = renderSize();
  const size = size_arr.find(item => item === product_detail.size);
  checkStock(size);
}

function checkStock(size) {
  const variants =  product_detail.data.variants;
  const sizeDiv = document.querySelectorAll('.size');
  if (size) {
    const stock = variants.find((item) => {
      if (item.color_code === product_detail.color_code && item.size === product_detail.size) {
        return item.stock;
      }
    });
    product_detail.stock = stock.stock;
  } else {
    const size = variants.find((item) => {
      if (item.color_code === product_detail.color_code) {
        return item.size;
      }
    });
    product_detail.size = size.size;
  }
  sizeDiv.forEach(size => {
    if (size.getAttribute('value') === product_detail.size) {
      size.setAttribute('class', 'size current');
    }
  });
}

function checkCartList(cartList, addProduct) {
  cartList.forEach(item => {
    if (item.product_id === addProduct.product_id && item.size === addProduct.size && item.color_code === addProduct.color_code) {
      const new_count = Number(item.count) + Number(addProduct.count);
      item.count = new_count;
      item.price = addProduct.price;
    }
  });
  cartList.push(addProduct);
  return cartList;
}

async function getProduct() {
  try {
    const url = new URLSearchParams(window.location.search);
    const id = url.get('id');
    const product_url = `api/1.0/products/details?id=${id}`;
    const product = await fetchDataByGet(product_url);
    if (product.error) return alert(product.error.msg);
    localStorage.setItem('productData', JSON.stringify(product));
    return product;
  } catch (error) {
    console.log(error.msg);
    alert(error.msg);
  }
}

function renderProduct(product) {
  return new Promise((resolve) => {
    mainImage.setAttribute('id', 'product-main-image');
    mainImage.className = 'name';
    img.src = `${product.data.main_image}`;
    mainImage.appendChild(img);
    view.prepend(mainImage);

    // product image, title, number, price
    product_name.setAttribute('id', 'product-name');
    product_name.className = 'name';
    product_name.innerHTML = `${product.data.title}`;
    id.setAttribute('id', 'product-id');
    id.className = 'id';
    id.innerHTML = `${product.data.id}`;
    price.setAttribute('id', 'product-price');
    price.className = 'price';
    price.innerHTML = `${product.data.price}`;
    details.prepend(price);
    details.prepend(id);
    details.prepend(product_name);

    // render color
    product.data.colors.forEach(color => {
      const color_box = document.createElement('div');
      color_box.className = 'color';
      color_box.name = `#${color}`;
      color_box.style.backgroundColor = `#${color.code}`;
      color_box.setAttribute('code', `${color.code}`);
      color_box.setAttribute('value', `${color.code}`);
      colorBox.appendChild(color_box);
    });

    // render size
    product.data.sizes.forEach(size => {
      const size_box = document.createElement('div');
      size_box.className = 'size';
      size_box.name = `#${size}`;
      size_box.innerHTML = `${size}`;
      size_box.style.backgroundColor = `#${size}`;
      size_box.setAttribute('code', `${size}`);
      size_box.setAttribute('value', `${size}`);
      sizeBox.appendChild(size_box);
    });

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
    const summary1 = product.data.note + '<br><br>';
    const texture = product.data.texture.split('/');
    let summary2 = '';
    texture.forEach(text => summary2 += text + '<br>');
    const summary3 = '<br>清洗：' + product.data.wash + '<br>產地：' + product.data.place;
    summary.innerHTML = summary1 + summary2 + summary3;

    // product story
    story.innerHTML = product.data.description;

    // product images
    product.data.images.forEach(image => {
      const img = document.createElement('img');
      img.src = image;
      images.appendChild(img);
    });
    resolve();
  });
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
      }
    });
    size.forEach(item => {
      if (item.getAttribute('value') === data.size) {
        item.setAttribute('class', 'size current');
        return;
      }
    });
    resolve();
  });
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
  try {
    const product = await getProduct();
    await renderProduct(product);
    product_detail = product;
    const variants = product_detail.data.variants;
    product_detail.color_code = document.getElementsByClassName('color')[0].getAttribute('value');
    variants.forEach(variant => {
      if (variant.color_code === product_detail.color_code) {
        product_detail.size = variant.size;
        product_detail.stock = variant.stock;
      }
    });
    if (product_detail.stock !== 0) {
      document.querySelector('.value').value = 1;
    } else {
      document.querySelector('.value').value = 0;
    }
    await currentRender(product_detail);
    countCart();
  } catch (error) {
    console.log(error.msg);
    alert(error.msg);
  }
}

document.addEventListener('DOMContentLoaded', init());