const urlParams = new URLSearchParams(window.location.search);
const idquery = urlParams.get("id");

let preventObj = {};

// init choice
let mainImage = document.createElement("div");
let name = document.createElement("div");
let id = document.createElement("div");
let price = document.createElement("div");
let img = document.createElement("img");
let view = document.querySelector("#viewM");
let details = document.querySelector(".details");
let colors = document.querySelector(".colors");
let titleC = document.querySelector("#titleC");
let colorBox = document.querySelector(".colorBox");
let titleS = document.querySelector("#titleS");
let sizeBox = document.querySelector(".sizeBox");
let summary = document.querySelector(".summary");
let story = document.querySelector(".story");
let images = document.querySelector(".images");

// click color
colorBox.addEventListener("click", (event) => {
  let data = localStorage.getItem('productData');
  let variants = JSON.parse(data).data.variants;

  if (event.target.getAttribute("code") !== null) {
    // color reset
    for (let i = 0; i < document.querySelectorAll(".color").length; i++) {
      document.querySelectorAll(".color")[i].className = "color";
    }

    // setting preventObj
    event.target.className = "color current";
    currentColor = event.target.getAttribute("code");
    preventObj.color_code = currentColor;
    
    // check
    let sizeOK = checkSize(variants, preventObj);
    checkStock(sizeOK, variants, preventObj);
  }
});

// click size
sizeBox.addEventListener("click", (event) => {
  let data = localStorage.getItem('productData');
  let variants = JSON.parse(data).data.variants;
  if (event.target.getAttribute("code") !== null && event.target.getAttribute('class') !== "size disabled") {
    // size reset
    for (let i = 0; i < document.querySelectorAll(".size").length; i++) {
      document.querySelectorAll(".size")[i].className = "size";
    }

    // setting preventObj
    event.target.className = "size current";
    currentSize = event.target.getAttribute("code");
    preventObj.size = currentSize;

    // check
    let sizeOK = checkSize(variants, preventObj);
    checkStock(sizeOK, variants, preventObj);

  }
});

function checkSize(variants, preventObj) {
  // disabled size
  let divSize = document.getElementsByClassName('size'); // array
  for (let k = 0; k < divSize.length; k++) {
    divSize[k].setAttribute("class", "size disabled");
  }
  // find abled size
  let sizeArr = [];
  for (let i = 0; i < variants.length; i++) {
    if (variants[i].color_code === preventObj.color_code) {
      sizeArr.push(variants[i].size)
    }
  }
  // display exist size
  for (let i = 0; i < divSize.length; i++) {
    sizeArr.find((item) => {
      if (item === divSize[i].innerHTML) {
        return divSize[i].setAttribute("class", "size")
      }
    })
  };
  let sizeOK = sizeArr.find((item) => {
    return item === preventObj.size
  })
  return sizeOK;
}

function checkStock(sizeOK, variants, preventObj) {
  const sizeDiv = document.querySelectorAll('.size');
  if (sizeOK) {
    for (let i = 0; i < sizeDiv.length; i++) {
      if (sizeDiv[i].getAttribute('value') === preventObj.size) {
        sizeDiv[i].setAttribute("class", "size current");
        break;
      }
    }
    let stock = variants.find((item) => {
      if (item.color_code === preventObj.color_code && item.size === preventObj.size) {
        return item.stock;
      }
    })
    preventObj.stock = stock.stock;
  } else {
    let size = variants.find((item) => {
      if (item.color_code === preventObj.color_code) {
        return item.size
      }
    })
    preventObj.size = size.size;
    preventObj.stock = size.stock;
    for (let i = 0; i < sizeDiv.length; i++) {
      if (sizeDiv[i].getAttribute('value') === preventObj.size) {
        sizeDiv[i].setAttribute("class", "size current");
        break;
      }
    }
  }
}

let btnAdd = document.createElement("button");
let btnSub = document.createElement("button");
let stockNum = document.createElement("input");
let qty = document.querySelector('#product-qty');


qty.addEventListener("click", (event) => {
  const stock = preventObj.stock;
  if (stock !== 0) {
    if (event.target.className === "add") {
      if (Number(document.querySelector(".value").value) < stock) {
        document.querySelector(".value").value = parseInt(document.querySelector(".value").value) + 1;
      } else {
        document.querySelector(".value").value = stock;
      }
    } else if (event.target.className === "sub") {
      if (Number(document.querySelector(".value").value) === 1) {
        document.querySelector(".value").value = 1
      } else if (Number(document.querySelector(".value").value) > stock) {
        document.querySelector(".value").value = stock;
      } else {
        document.querySelector(".value").value = parseInt(document.querySelector(".value").value) - 1;
      }
    }
  } else {
    document.querySelector(".value").value = 0;
  }
});

const data = async() => {
  await saveData();
  let data = await getData();
  await renderProduct(JSON.parse(data));
  let variants = JSON.parse(data).data.variants;
  preventObj.color_code = document.getElementsByClassName('color')[0].getAttribute('value')

  for(let i=0; i<variants.length; i++){
    if (variants[i].color_code === preventObj.color_code){
      preventObj.size = variants[i].size;
      preventObj.stock = variants[i].stock ;
      break;
    }
  }
  if (preventObj.stock !== 0) {
    document.querySelector(".value").value = 1;
  } else {
    document.querySelector(".value").value = 0;
  }
  
  await currentRender(preventObj, variants);
  // console.log(preventObj)
  // console.log("variants", variants);
}

function currentRender(data, variants) {
  return new Promise ((resolve, reject)=>{
    // disabled size
    let divSize = document.getElementsByClassName('size'); // array
    for (let k = 0; k < divSize.length; k++) {
      divSize[k].setAttribute("class", "size disabled");
    }
    // find abled size
    let sizeArr = [];
    for (let i = 0; i < variants.length; i++) {
      if (variants[i].color_code === data.color_code) {
        sizeArr.push(variants[i].size)
      }
    }
    // display exist size
    for (let i = 0; i < divSize.length; i++) {
      sizeArr.find((item) => {
        if (item === divSize[i].innerHTML) {
          return divSize[i].setAttribute("class", "size")
        }
      })
    };

    const color = document.querySelectorAll('.color');
    const size = document.querySelectorAll('.size');
    for (let i = 0; i < color.length; i++) {
      if (color[i].getAttribute('value') === data.color_code) {
        color[i].setAttribute("class", "color current");
        break;
      }
    }; 
    for (let i = 0; i < size.length; i++) {
      if (size[i].getAttribute('value') === data.size) {
        size[i].setAttribute("class", "size current");
        break;
      }
    } 
    resolve();
  })
}

function saveData() {
  return fetch(`api/1.0/products/details?id=${idquery}`)
    .then((response) => response.json())
    .then((data) => {
      // save data in localstorge
      localStorage.setItem('productData', JSON.stringify(data));
    })
    .catch((error) => {
      // console.log(error);
    });
}

function getData() {
  let result = localStorage.getItem('productData');
  return result;
}

function renderProduct(data) {
  return new Promise( (resolve, reject) => {
    cartList = {};

    mainImage.setAttribute("id", "product-main-image");
    mainImage.className = "name";
    img.src = `${data.data.main_image}`;
    mainImage.appendChild(img);
    view.prepend(mainImage);

    // product image, title, number, price
    name.setAttribute("id", "product-name");
    name.className = "name";
    name.innerHTML = `${data.data.title}`;
    id.setAttribute("id", "product-id");
    id.className = "id";
    id.innerHTML = `${data.data.id}`;
    price.setAttribute("id", "product-price");
    price.className = "price";
    price.innerHTML = `${data.data.price}`;
    details.prepend(price);
    details.prepend(id);
    details.prepend(name);

    // render color
    for (let j = data.data.colors.length - 1; j >= 0; j--) {
      let color = document.createElement("div");
      color.className = "color";
      color.name = `#${data.data.colors[j]}`;
      color.style.backgroundColor = `#${data.data.colors[j].code}`;
      color.setAttribute("code", `${data.data.colors[j].code}`);
      color.setAttribute("value", `${data.data.colors[j].code}`);
      colorBox.appendChild(color);
    }

    // render size
    for (let j = data.data.sizes.length - 1; j >= 0; j--) {
      let size = document.createElement("div");
      size.className = "size";
      size.name = `#${data.data.sizes[j]}`;
      size.innerHTML = `${data.data.sizes[j]}`;
      size.style.backgroundColor = `#${data.data.sizes[j]}`;
      size.setAttribute("code", `${data.data.sizes[j]}`);
      size.setAttribute("value", `${data.data.sizes[j]}`);
      sizeBox.appendChild(size);
    }

    // render stock
    btnAdd.className = "add";
    btnAdd.innerHTML = "+";
    btnSub.className = "sub";
    btnSub.innerHTML = "-";
    stockNum.className = "value";
    stockNum.setAttribute('value', 0);
    stockNum.setAttribute('disabled', "disabled");
    qty.prepend(btnAdd);
    qty.prepend(stockNum);
    qty.prepend(btnSub);

    // product summary
    let summary1 = `${data.data.note}<br><br>`;
    let texture = `${data.data.texture}`.split("/");
    summary2 = "";
    for (let i = 0; i < texture.length; i++) {
      summary2 += texture[i] + "<br>";
    }
    let summary3 = `<br>清洗：${data.data.wash}<br>產地：${data.data.place}`;
    summary.innerHTML = summary1 + summary2 + summary3;

    // product story
    story.innerHTML = `${data.data.description}`;

    // product images
    for (let j = 0; j < data.data.images.length; j++) {
      let img = document.createElement("img");
      img.src = `${data.data.images[j]}`;
      images.appendChild(img);
    }
    resolve();
  })
}

// add cart
let cart = document.querySelector(".add-cart");

cart.addEventListener("click", () => {
  // save product info.
  let data = localStorage.getItem('productData');
  let purchase = JSON.parse(data);
  cartList.product_id = purchase.data.id;
  cartList.title = purchase.data.title;
  cartList.price = parseInt(purchase.data.price.split(".")[1]);
  cartList.main_image = purchase.data.main_image;
  cartList.color_code = preventObj.color_code;
  cartList.size = preventObj.size;
  cartList.count = document.querySelector(".value").value;
  // console.log(cartList);
  localStorage.setItem('userCart', JSON.stringify(cartList));

  if (localStorage.getItem("userToken")) {
    const data = {
      "token": localStorage.getItem("userToken")
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
          window.location.replace("/signup_signin.html");
        } else {
          window.location.replace('/cart.html')
        }
      });
  } else if (localStorage.getItem("fbToken")) {
    const data = {
      "token": localStorage.getItem("fbToken")
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
        // console.log(body)
        if (body.error) {
          // alert(body.error);
          alert("登入逾時，請重新登入")
          window.location.replace("/signup_signin.html");
        } else {
          window.location.replace('/cart.html')
        }
      });
  } else {
    alert("請先登入會員");
    window.location.replace("/signup_signin.html");
  }
});