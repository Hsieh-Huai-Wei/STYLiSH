let paging = 0;
let next_page = true;

async function getCampaign() {
  try {
    const campaign_url = 'api/1.0/marketing/campaigns';
    const campaigns = await fetchDataByGet(campaign_url);
    if ( campaigns.error || campaigns.msg ) throw new Error();
    campaigns.data.forEach(campaign => {
      const a = document.createElement('a');
      const story = document.createElement('div');
      const key_visual = document.querySelector('.keyvisual');
      a.className = 'visual';
      a.href = `/product.html?id=${campaign.number}`;
      a.style.backgroundImage = `url('${campaign.picture[0]}')`;
      const storyText = campaign.story.split('/');
      let storyDisplay = '';
      storyText.forEach(text => storyDisplay += text + '<br>');
      story.className = 'story';
      story.innerHTML = storyDisplay;
      a.appendChild(story);
      key_visual.appendChild(a);
    });
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

function renderProducts(products) {
  console.log(products)
  if (products.msg || products.data.length === 0) return;
  for (let i = 0; i<products.data.length; i++) {
    const a = document.createElement('a');
    const img = document.createElement('img');
    const color_box = document.createElement('div');
    const name = document.createElement('div');
    const price = document.createElement('div');
    const products_box = document.querySelector('.products');
    a.className = 'product';
    console.log(products.data[i])
    a.href = `/product.html?id=${products.data[i].id}`;
    img.src = `${products.data[i].main_image}`;
    color_box.className = 'colors';
    products.data[i].colors.forEach(color => {
      const color_div = document.createElement('div');
      color_div.className = 'color';
      color_div.style.backgroundColor = `#${color.code}`;
      color_box.appendChild(color_div);
    });
    name.className = 'name';
    name.innerHTML = `${products.data[i].title}`;
    price.className = 'price';
    price.innerHTML = `${products.data[i].price}`;
    a.appendChild(img);
    a.appendChild(color_box);
    a.appendChild(name);
    a.appendChild(price);
    products_box.appendChild(a);
  }
}

async function getProducts(tag) {
  try {
    const products_url = `api/1.0/products/${tag}?paging=${paging}`;
    const products = await fetchDataByGet(products_url);
    console.log(products)
    if ( products.error ) throw new Error();
    if (products.next_paging === undefined) next_page = false;
    return products;
  } catch (error) {
    console.log(error);
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

function getURL() {
  const browser_url = new URLSearchParams(window.location.search);
  let api_url = '';
  if (browser_url.get('tag') !== null) {
    api_url += browser_url.get('tag');
  } else if (browser_url.get('keyword') !== null) {
    api_url += 'search?keyword=' + browser_url.get('keyword');
  } else {
    api_url += 'all';
  };
  return api_url;
}

async function init() {
  try {
    removeDiv();
    const api_url = getURL();
    const products = await getProducts(api_url);
    if (products.data.length === 0) throw new Error();
    renderProducts(products);
    await getCampaign();
    countCart();
    const campaigns = document.querySelector('#keyvisual');
    if (campaigns.children.length > 0) {
      showFirstCampaigns(campaigns);
      switchCampaigns(campaigns);
    }
  } catch (error) {
    console.log(error);
  }
}

function showFirstCampaigns(campaigns) {
  campaigns.children[1].classList.add('current');
}

function switchCampaigns(campaigns) {
  let step = 1;
  setInterval(()=>{
    if (step === 3 ) {
      campaigns.children[step].classList.remove('current');
      step = 1;
      campaigns.children[step].classList.add('current');
    } else {
      campaigns.children[step].classList.remove('current');
      campaigns.children[step+1].classList.add('current');
      step += 1;
    }
  }, 5000)
}

async function loadMore() {
  if (window.pageYOffset >= 872 && next_page) {
    paging += 1;
    const api_url = getURL();
    const products = await getProducts(api_url);
    console.log(products)
    renderProducts(products);
  }
}

window.addEventListener('scroll', () => loadMore())
document.addEventListener('DOMContentLoaded', init());