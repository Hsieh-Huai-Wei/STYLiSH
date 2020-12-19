TPDirect.setupSDK(
  12348,
  "app_pa1pQcKoY22IlnSXq5m5WP5jFKzoRG58VEXpT7wU62ud7mMbDOGzCYIlzzLF",
  "sandbox"
);

TPDirect.card.setup({
  fields: {
    list: "#list",
    number: {
      // css selector
      element: "#card-number",
      placeholder: "**** **** **** ****",
    },
    expirationDate: {
      // DOM object
      element: document.getElementById("card-expiration-date"),
      placeholder: "MM / YY",
    },
    ccv: {
      element: "#card-ccv",
      placeholder: "後三碼",
    },
  },
  styles: {
    // Style all elements
    input: {
      color: "gray",
    },
    // Styling ccv field
    "input.cvc": {
      // 'font-size': '16px'
    },
    // Styling expiration-date field
    "input.expiration-date": {
      // 'font-size': '16px'
    },
    // Styling card-number field
    "input.card-number": {
      // 'font-size': '16px'
    },
    // style focus state
    ":focus": {
      // 'color': 'black'
    },
    // style valid state
    ".valid": {
      color: "green",
    },
    // style invalid state
    ".invalid": {
      color: "red",
    },
    // Media queries
    // Note that these apply to the iframe, not the root window.
    "@media screen and (max-width: 400px)": {
      input: {
        color: "orange",
      },
    },
  },
});

TPDirect.card.onUpdate(function (update) {
  // update.canGetPrime === true
  // --> you can call TPDirect.card.getPrime()
  if (update.canGetPrime) {
    // Enable submit Button to get prime.
    // submitButton.removeAttribute('disabled')
  } else {
    // Disable submit Button to get prime.
    // submitButton.setAttribute('disabled', true)
  }

  // cardTypes = ['mastercard', 'visa', 'jcb', 'amex', 'unknown']
  if (update.cardType === "visa") {
    // Handle card type visa.
  }

  // number 欄位是錯誤的
  if (update.status.number === 2) {
    // setNumberFormGroupToError()
  } else if (update.status.number === 0) {
    // setNumberFormGroupToSuccess()
  } else {
    // setNumberFormGroupToNormal()
  }

  if (update.status.expiry === 2) {
    // setNumberFormGroupToError()
  } else if (update.status.expiry === 0) {
    // setNumberFormGroupToSuccess()
  } else {
    // setNumberFormGroupToNormal()
  }

  if (update.status.cvc === 2) {
    // setNumberFormGroupToError()
  } else if (update.status.cvc === 0) {
    // setNumberFormGroupToSuccess()
  } else {
    // setNumberFormGroupToNormal()
  }
});

TPDirect.card.getTappayFieldsStatus();

function onSubmit(event) {

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
          window.location.replace("/login.html");
        } else {
          // 取得 TapPay Fields 的 status
          const tappayStatus = TPDirect.card.getTappayFieldsStatus();
          // 確認是否可以 getPrime
          if (tappayStatus.canGetPrime === false) {
            // alert("can not get prime");
            // console.log("can not get prime");
            return;
          }
          // Get prime
          TPDirect.card.getPrime((result) => {
            if (result.status !== 0) {
              // console.log("get prime error " + result.msg);
              alert("get prime error " + result.msg);
            }
            // console.log("get prime 成功，prime: " + result.card.prime);
            const userCart = localStorage.getItem("userCart")
            const price = JSON.parse(userCart).price
            let results = {
              prime: result.card.prime,
              totalPrice: price,
              user_id: body.id
            };

            fetch("api/1.0/order/checkout", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(results),
            })
              .then((res) => res.json())
              .then((body) => {
                localStorage.setItem('userOrder', JSON.stringify(body.data.number));
                window.location.replace("/thankyou.html");
              });
          });
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
          window.location.replace("/login.html");
        } else {
          // 取得 TapPay Fields 的 status
          const tappayStatus = TPDirect.card.getTappayFieldsStatus();
          // 確認是否可以 getPrime
          if (tappayStatus.canGetPrime === false) {
            // alert("can not get prime");
            // console.log("can not get prime");
            return;
          }
          // Get prime
          TPDirect.card.getPrime((result) => {
            if (result.status !== 0) {
              // console.log("get prime error " + result.msg);
              alert("get prime error " + result.msg);
            }
            // console.log("get prime 成功，prime: " + result.card.prime);
            const price = localStorage.getItem("userCart").split(',')[3].split(':')[1];

            let results = {
              prime: result.card.prime,
              totalPrice: price
            };

            fetch("api/1.0/order/checkout", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(results),
            })
              .then((res) => res.json())
              // .then(console.log("OK"))
              .then((body) => {
                // console.log(body)
                localStorage.setItem('userOrder', JSON.stringify(body.data.number));
                window.location.replace("/thankyou.html");
              });
          });
        }
      });
  } else {
    alert("請先登入會員");
    window.location.replace("/login.html");
  }

}