/// <reference path="jQuery/jquery-3.6.0.min.js" />

$(`#aboutPage`).on("click", async function () {
  let pageContent = await ajaxRequest("about.html");
  console.log(pageContent);
  $("#cards").html(pageContent);
});

$(`#homePage`).on("click", async function () {
  location.reload();
});

$("#search").on("keyup", function (e) {
  if (e.key === "Enter" || e.keyCode === 13) {
    $(`#searchBtn`).trigger("click");
  }
});

$(`#search`).on("input", function () {
  let value = $("#search").val();
  let cards = $("#cards > div");
  let length = $("#cards > div").length;
  if (value == ``) {
    if (length > 15) {
      $(cards.splice(15, length)).hide();
      cards = cards.splice(0, 15);
    }
    $(cards).show();
  }
});

function ajaxRequest(url) {
  return new Promise((resolve, reject) => {
    $.ajax({
      url: url,
      success: (response) => resolve(response),
      error: (err) => reject(err),
    });
  });
}

async function getCoins() {
  try {
    let pageIndex = 0;
    let checkedMap = new Map();
    let response;
    response = await ajaxRequest("https://api.coingecko.com/api/v3/coins/list");

    let cardHtml = "";
    let cardArray = new Array();
    let cardIdArray = new Array();
    for (coin of response) {
      sessionStorage.setItem(`${coin.id}`, "-1");
      cardIdArray.push(`${coin.symbol}Card`);
      cardArray.push(addCard(coin));
    }
    let temp = [...cardArray];
    let splicedCardArray = new Array();
    //let tmp = new Array(cardArray);
    for (let i = 0; i < temp.length - 15; i += 15) {
      splicedCardArray.push(temp.splice(i, 15));
    }

    $("#cards").append([...cardArray].splice(pageIndex * 15, 15));

    $("#prevBtn").on("click", function () {
      checkedMap.clear();
      let tmp = [...cardArray];
      pageIndex--;
      $("#cards").html(tmp.splice(pageIndex * 15, 15));
    });

    $("#nextBtn").on("click", function () {
      checkedMap.clear();
      let tmp = [...cardArray];
      pageIndex++;
      $("#cards").html(tmp.splice(pageIndex * 15, 15));
    });

    $(document).on("click", ".infoBtn", function () {
      getInfo(this.parentElement.parentElement, this);
    });

    $(`#searchBtn`).on("click", function () {
      let value = $("#search").val();
      value = `${value}Card`;
      let cards = $("#cards > div");
      cards.hide();
      let index = cardIdArray.indexOf(value);
      if (index != -1) {
        $("#cards").append(cardArray[index]);
      }
    });

    $(document).on("change", ".reportsSwitch", function () {
      //validate toggle button on cards
      coinId = this.parentElement.parentElement.id;
      if (this.checked) {
        if (checkedMap.size < 5) {
          checkedMap.set(coinId, "true");
        } else {
          $(`#${this.id}`).prop("checked", false);
          alert("Please Remove One Of The Other Coins To Add Another To The Reports");
        }
      } else {
        checkedMap.delete(coinId);
      }
    });
  } catch (error) {
    console.log(error);
  }
}

function addCard(coin) {
  let symbol = coin.symbol;
  // don't allow special characters (creates bugs in the website)
  symbol = symbol.replace(/\W/g, "");

  coin.symbol = symbol;
  let cardHtml = `<div id="${symbol}Card" class="card text-white bg-dark">
      <div id="${coin.id}" class="card-body">
        <div class="custom-control custom-switch">
          <input type="checkbox" class="custom-control-input reportsSwitch" id="${coin.symbol}Switch">
          <label class="custom-control-label" for="${coin.symbol}Switch"></label>
        </div>
        <h5 class="card-title">${coin.symbol.toUpperCase()}</h5>
        <p class="card-text">${coin.name}</p>
        <p>
          <button id="${coin.id}Btn" class="btn infoBtn btn-light" type="button">
            More Info
          </button>
        </p>
        <div class="collapse coins-collapse" id="${coin.symbol}Collapse">
          <div id="${coin.symbol}Info" class="card card-body">
          </div>
        </div>
      </div>
    </div>`;
  return cardHtml;
}

async function getInfo(elem, btn) {
  let coinInfo;
  if (sessionStorage.getItem(`${elem.id}`) == "-1") {
    let coin = elem.id;
    $(`#${elem.id}Btn`).text("Loading...");
    coinInfo = await ajaxRequest(`https://api.coingecko.com/api/v3/coins/${coin}`);
    sessionStorage.setItem(`${elem.id}`, `${JSON.stringify(coinInfo)}`);
  } else {
    coinInfo = sessionStorage.getItem(`${elem.id}`);
    coinInfo = JSON.parse(coinInfo);
  }
  setInfo(btn, coinInfo); //set collapse info html
  $(`#${coinInfo.symbol}Collapse`).collapse("toggle"); //toggle collapsable info
}

function setInfo(elem, coinInfo) {
  let height = $(`#${coinInfo.symbol}Card`).height() > 180 ? "180px" : "400px";
  $(`#${coinInfo.symbol}Card`).css("height", height);
  let str = height == "180px" ? "More Info" : "Less Info";
  $(`#${elem.id}`).text(str);

  $(`#${coinInfo.symbol}Info`).html(
    `
    <p>
    Icon: <img src="${coinInfo.image.thumb}" alt="" decoding="async" width="25px" height="25px"/> <br />
    Current Price: <br />
    USD: ${coinInfo.market_data.current_price.usd}&#36; <br />
    EUR: ${coinInfo.market_data.current_price.eur}&#128; <br />
    ILS: ${coinInfo.market_data.current_price.ils}&#8362;
    </p>
    `
  );
}
