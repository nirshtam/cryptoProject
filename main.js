/// <reference path="jQuery/jquery-3.6.0.min.js" />

$(`#searchBtn`).on("click", function () {
  let value = $("#search").val();
  value = `${value}Card`;
  let cards = $("#cards > div");
  cards.hide();
  $(`#${value}`).show();
});

$("#search").on("keyup", function (e) {
  if (e.key === "Enter" || e.keyCode === 13) {
    $(`#searchBtn`).trigger("click");
  }
});

$(`#search`).on("input", function () {
  let value = $("#search").val();
  let cards = $("#cards > div");
  if (value == ``) {
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
    let response;
    response = await ajaxRequest("https://api.coingecko.com/api/v3/coins/list");

    let cardHtml = "";
    let cardArray = new Array();
    for (coin of response) {
      sessionStorage.setItem(`${coin.id}`, "-1");
      cardArray.push(addCard(coin));
    }
    $("#cards").append(cardArray.splice(0, 7000));

    $(".infoBtn").on("click", function () {
      getInfo(this);
    });
  } catch (error) {
    console.log(error);
  }
}

function addCard(coin) {
  let symbol = coin.symbol;
  // don't allow special characters
  symbol = symbol.replace(/\W/g, "");

  coin.symbol = symbol;
  let cardHtml = `<div id="${symbol}Card" class="card text-white bg-dark">
      <div class="card-body">
        <div class="custom-control custom-switch">
          <input type="checkbox" class="custom-control-input" id="${coin.symbol}Switch">
          <label class="custom-control-label" for="${coin.symbol}Switch"></label>
        </div>
        <h5 class="card-title">${coin.symbol.toUpperCase()}</h5>
        <p class="card-text">${coin.name}</p>
        <p>
          <button id="${coin.id}" class="btn infoBtn btn-light" type="button">
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

async function getInfo(elem) {
  let coinInfo;
  if (sessionStorage.getItem(`${elem.id}`) == "-1") {
    let coin = elem.id;
    $(`#${elem.id}`).text("Loading...");
    coinInfo = await ajaxRequest(`https://api.coingecko.com/api/v3/coins/${coin}`);
    sessionStorage.setItem(`${elem.id}`, `${JSON.stringify(coinInfo)}`);
  } else {
    coinInfo = sessionStorage.getItem(`${elem.id}`);
    coinInfo = JSON.parse(coinInfo);
  }
  setInfo(elem, coinInfo);
  $(`#${coinInfo.symbol}Collapse`).collapse("toggle");
}

function setInfo(elem, coinInfo) {
  let height = $(`#${coinInfo.symbol}Card`).height() > 200 ? "200px" : "400px";
  $(`#${coinInfo.symbol}Card`).css("height", height);
  let str = height == "200px" ? "More Info" : "Less Info";
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
