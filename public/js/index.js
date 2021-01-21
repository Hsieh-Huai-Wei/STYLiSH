function countCart() {
  const cart_str = localStorage.getItem('userCart');
  if (cart_str) {
    const cart = JSON.parse(cart_str);
    const cart_count = document.getElementById('cart-qty');
    cart_count.textContent = cart.length;
  }
}

function getCampaign() {
  fetch('api/1.0/marketing/campaigns')
  .then(response => response.json())
  .then(campaigns => {
    campaigns.data.forEach(campaign => {
      const a = document.createElement('a');
      const story = document.createElement('div');
      const keyvisual = document.querySelector('.keyvisual');
      a.className = 'visual';
      a.href = `/product.html?id=${campaign.product_id}`;
      a.style.backgroundImage = `url('${campaign.picture[0]}')`;
      const storyText = campaign.story.split('/');
      let storyDisplay = '';
      storyText.forEach(text => storyDisplay += text + '<br>');
      story.className = 'story';
      story.innerHTML = storyDisplay;
      a.appendChild(story);
      keyvisual.appendChild(a);
    })
  })
  .catch((error) => console.log(error))
}

function getProducts() {
  fetch(`api/1.0/products/tag`)
  .then(response => response.json())
  .then(products => {
    products.data.forEach(product => {
      const a = document.createElement('a');
      const img = document.createElement('img');
      const colors = document.createElement('div');
      const name = document.createElement('div');
      const price = document.createElement('div');
      const products = document.querySelector('.products');
      a.className = 'product';
      a.href = `/product.html?id=${[i + 1]}`;
      img.src = `${product.main_image}`;
      colors.className = 'colors';
      const color = document.createElement('div');
      product.colors.forEach(color => {
        color.className = 'color';
        color.style.backgroundColor = `#${color.code}`;
        colors.appendChild(color);
      })
      name.className = 'name';
      name.innerHTML = `${product.title}`;
      price.className = 'price';
      price.innerHTML = `${product.price}`;
      a.appendChild(img);
      a.appendChild(colors);
      a.appendChild(name);
      a.appendChild(price);
      products.appendChild(a);
    })
  })
  .catch((error) => console.log(error))
}

function removeDiv() {

}

// function init() {
//   countCart();
//   getCampaign();
//   removeDiv();
//   getProducts();
// }

function init() {
  let a = new URLSearchParams(window.location.search)
  console.log(a.get('name'))
  console.log(a.getAll('name'))
  let b = new URLSearchParams(document.location.search)
  console.log(b.get('name'))
  console.log(b.getAll('name'))
  let c = new URLSearchParams(location.search)
  console.log(c.get('name'))
  console.log(c.getAll('name'))
}

document.addEventListener('DOMContentLoaded', init())