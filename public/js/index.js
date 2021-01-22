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
      const key_visual = document.querySelector('.keyvisual');
      a.className = 'visual';
      a.href = `/product.html?id=${campaign.product_id}`;
      a.style.backgroundImage = `url('${campaign.picture[0]}')`;
      const storyText = campaign.story.split('/');
      let storyDisplay = '';
      storyText.forEach(text => storyDisplay += text + '<br>');
      story.className = 'story';
      story.innerHTML = storyDisplay;
      a.appendChild(story);
      key_visual.appendChild(a);
    })
  })
  .catch((error) => console.log(error))
}

function getProducts(tag) {
  fetch(`api/1.0/products/${tag}`)
  .then(response => response.json())
  .then(products => {
    for (let product_index = 0; product_index<products.data.length; product_index++) {
      const a = document.createElement('a');
      const img = document.createElement('img');
      const color_box = document.createElement('div');
      const name = document.createElement('div');
      const price = document.createElement('div');
      const products_box = document.querySelector('.products');
      a.className = 'product';
      a.href = `/product.html?id=${[product_index + 1]}`;
      img.src = `${products.data[product_index].main_image}`;
      color_box.className = 'colors';
      products.data[product_index].colors.forEach(color => {
        const color_div = document.createElement('div');
        color_div.className = 'color';
        color_div.style.backgroundColor = `#${color.code}`;
        color_box.appendChild(color_div);
      })
      name.className = 'name';
      name.innerHTML = `${products.data[product_index].title}`;
      price.className = 'price';
      price.innerHTML = `${products.data[product_index].price}`;
      a.appendChild(img);
      a.appendChild(color_box);
      a.appendChild(name);
      a.appendChild(price);
      products_box.appendChild(a);
    }
  })
  .catch((error) => console.log(error))
}

function removeDiv() {
  const product_list = document.querySelector('#products');
  const view = document.querySelector('.view');
  const product_box = document.createElement('div');
  product_list.remove();
  product_box.id = 'products';
  product_box.classList = 'products';
  view.appendChild(product_box);
}

async function init() {
  removeDiv();
  const url = new URLSearchParams(window.location.search);
  if (url.get('tag') === null) {
    await getProducts('all');
  } else {
    await getProducts(url.get('tag'));
  } 
  await getCampaign();
  countCart();
}

document.addEventListener('DOMContentLoaded', init())