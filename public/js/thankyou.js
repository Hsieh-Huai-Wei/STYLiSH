function getUserData() {
  const data = {
    "token": localStorage.getItem("userToken")
  }
  fetch("api/1.0/user/profile", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  .then((res) => res.json())
  .then((body) => {
    if (body.error) {
      alert(body.error);
    } else {
      const userName = `${body.name}`
      const orderNum = localStorage.getItem("userOrder");
      const user = document.getElementById('response');
      const order = document.getElementById('order');
      user.textContent = `Dear ${userName},`;
      order.textContent = `Thanks for your order, number is ${orderNum} !`;
    }
  });
}

getUserData();