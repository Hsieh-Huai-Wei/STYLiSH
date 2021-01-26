async function fetchDataByGet(url) {
  const res_json = await fetch(url, {
    method: 'GET',
    headers: new Headers({
      'Content-Type': 'application/json'
    })
  });
  return res_json.json();
}

function countCart() {
  const cart_str = localStorage.getItem('userCart');
  if (cart_str) {
    const cart = JSON.parse(cart_str);
    const cart_count = document.getElementById('cart-qty');
    cart_count.textContent = cart.length;
  }
}

async function getCampaign() {
  try {
    const campaign_url = 'api/1.0/marketing/campaigns';
    const campaigns = await fetchDataByGet(campaign_url);
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
    });
  } catch (error) {
    console.log(error);
  }
}

async function getProducts(tag) {
  try {
    const products_url = `api/1.0/products/${tag}`;
    const products = await fetchDataByGet(products_url);
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
  } catch (error) {
    console.log(error)
  }
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
  const browser_url = new URLSearchParams(window.location.search);
  let api_url = '';
  console.log(browser_url.get('tag'))
  console.log(browser_url.get('keyword'))
  if (browser_url.get('tag') !== null) {
    api_url += browser_url.get('tag');
  } else if (browser_url.get('keyword') !== null) {
    api_url += 'search?keyword=' + browser_url.get('keyword');
  } else {
    api_url += 'all'
  }
  await getProducts(api_url);
  await getCampaign();
  countCart();
}

document.addEventListener('DOMContentLoaded', init())