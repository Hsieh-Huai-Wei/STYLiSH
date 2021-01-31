async function getCampaign() {
  try {
    const campaign_url = 'api/1.0/marketing/campaigns';
    const campaigns = await fetchDataByGet(campaign_url);
    if (campaigns.error) return alert(campaigns.error);
    if (campaigns.msg) return alert(campaigns.msg);
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
    alert('伺服器有問題，請稍後再試！'); 
  }
}

async function getProducts(tag) {
  try {
    const products_url = `api/1.0/products/${tag}`;
    const products = await fetchDataByGet(products_url);
    if (products.error) return alert(products.error);
    if (products.msg) return alert(products.msg);
    for (let i = 0; i<products.data.length; i++) {
      const a = document.createElement('a');
      const img = document.createElement('img');
      const color_box = document.createElement('div');
      const name = document.createElement('div');
      const price = document.createElement('div');
      const products_box = document.querySelector('.products');
      a.className = 'product';
      a.href = `/product.html?id=${[i + 1]}`;
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
  } catch (error) {
    console.log(error);
    alert('伺服器有問題，請稍後再試！'); 
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
  try {
    removeDiv();
    const browser_url = new URLSearchParams(window.location.search);
    let api_url = '';
    if (browser_url.get('tag') !== null) {
      api_url += browser_url.get('tag');
    } else if (browser_url.get('keyword') !== null) {
      api_url += 'search?keyword=' + browser_url.get('keyword');
    } else {
      api_url += 'all';
    }
    await getProducts(api_url);
    await getCampaign();
    countCart();
  } catch (error) {
   console.log(error);
   alert('伺服器有問題，請稍後再試！'); 
  }
}

document.addEventListener('DOMContentLoaded', init());