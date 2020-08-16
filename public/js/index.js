fetch("api/1.0/marketing/campaigns")
  .then((response) => response.json())
  // .then(response => console.log(response))
  .then(function (data) {
    // console.log(data)
    for (let i = 0; i < data.data.length; i++) {
      let a = document.createElement("a");
      let story = document.createElement("div");
      let keyvisual = document.querySelector(".keyvisual");

      a.className = "visual";
      a.href = `/product.html?id=${data.data[i].product_id}`;
      a.style.backgroundImage = `url('${data.data[i].picture}')`;
      let storyText = data.data[i].story.split("/");
      storyDisplay = "";
      for (let j = 0; j < storyText.length; j++) {
        storyDisplay += storyText[j] + "<br>";
      }
      story.className = "story";
      story.innerHTML = storyDisplay;
      a.appendChild(story);
      keyvisual.appendChild(a);
    }
  })
  .catch(function (error) {
    // console.log(error);
  });

fetch("api/1.0/products/all")
  .then((response) => response.json())
  // .then(response => console.log(response))
  .then(function (data) {
    // console.log(data.data);
    for (let i = 0; i < data.data.length; i++) {
      let a = document.createElement("a");
      let img = document.createElement("img");
      let colors = document.createElement("div");
      // let color = document.createElement('div');
      let name = document.createElement("div");
      let price = document.createElement("div");
      let products = document.querySelector(".products");
      a.className = "product";
      // a.href = `/product.html?id=${data.data[i].id}`;
      a.href = `/product.html?id=${[i + 1]}`;
      img.src = `${data.data[i].main_image}`;
      colors.className = "colors";

      for (let j = 0; j < data.data[i].colors.length; j++) {
        let color = document.createElement("div");
        color.className = "color";
        color.style.backgroundColor = `#${data.data[i].colors[j].code}`;
        colors.appendChild(color);
      }

      name.className = "name";
      name.innerHTML = `${data.data[i].title}`;
      price.className = "price";
      price.innerHTML = `${data.data[i].price}`;
      a.appendChild(img);
      a.appendChild(colors);
      a.appendChild(name);
      a.appendChild(price);
      products.appendChild(a);
    }
  })
  .catch(function (error) {
    // console.log(error);
  });
