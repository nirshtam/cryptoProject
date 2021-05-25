/// <reference path="jQuery/jquery-3.6.0.min.js" />

$(`#aboutPage`).on("click", async function () {
  //Navbar About Click Event, loads the html from the about.html page
  let pageContent = await ajaxRequest("about.html");
  $("#prevBtn").remove();
  $("#nextBtn").remove();
  $("#search").prop("disabled", true);
  $("#aboutPlaceHolder").html(pageContent);
  $("#cards").html("");
  $("#aboutPlaceHolder").height("520px");
});

$(`#homePage`).on("click", async function () {
  //Navbar Home Click Event, refreshes the website (in order to return to the first page)
  location.reload();
});

$("#search").on("keyup", function (e) {
  //deals with user Enter key input triggers the searchBtn click event
  if (e.key === "Enter" || e.keyCode === 13) {
    $(`#searchBtn`).trigger("click");
  }
});

$(`#search`).on("input", function () {
  //clears the search when user deletes the search input
  //deals with the deletion of the searched element and showing the page again
  let value = $("#search").val();
  let cards = $("#cards > div");
  let length = $("#cards > div").length;
  if (value == ``) {
    if (length > 15) {
      //if there are more than 15 cards
      $(cards.splice(15, length)).hide();
      cards = cards.splice(0, 15);
    }
    $(cards).show();
  }
});

function ajaxRequest(url) {
  //sends an ajax request
  return new Promise((resolve, reject) => {
    $.ajax({
      url: url,
      success: (response) => resolve(response),
      error: (err) => reject(err),
    });
  });
}

async function getCoins() {
  //this function is called on body load
  //receives the coins from the API
  //deals with creating the bootstrap cards of the coins
  //creates the events for the created elements
  try {
    $("#aboutPlaceHolder").height("0px"); //resets about page div

    let pageIndex = 0;
    let checkedMap = new Map();
    let cardArray = new Array();
    let cardIdArray = new Array();
    let response = await ajaxRequest("https://api.coingecko.com/api/v3/coins/list");

    for (coin of response) {
      sessionStorage.setItem(`${coin.id}`, "-1");
      cardIdArray.push(`${coin.symbol}Card`);
      cardArray.push(addCard(coin));
    }

    let splicedCardArray = new Array();
    for (let i = 0; i < cardArray.length - 15; i += 15) {
      splicedCardArray.push([...cardArray].splice(i, 15));
    }

    if (pageIndex == 0) {
      $("#prevBtn").attr("disabled", true);
    }

    $("#cards").append([...cardArray].splice(pageIndex * 15, 15));

    //-----------------------------Events-------------------------------
    //these events depend on the information received from the API and other variables in the getCoins function

    let prevBtnOnClickFunc;
    let nextBtnOnClickFunc;
    let infoBtnOnClickFunc;
    let searchBtnOnClickFunc;
    let reportsSwitchOnChangeFunc;

    $("#prevBtn").on("click", function () {
      prevBtnOnClickFunc = prevBtnOnClick.bind(this);
      prevBtnOnClickFunc();
      checkIndex();
    });

    $("#nextBtn").on("click", function () {
      nextBtnOnClickFunc = nextBtnOnClick.bind(this);
      nextBtnOnClickFunc();
      checkIndex();
    });

    $(document).on("click", ".infoBtn", async function () {
      infoBtnOnClickFunc = await infoBtnOnClick.bind(this);
      infoBtnOnClickFunc();
    });

    $(`#searchBtn`).on("click", function () {
      searchBtnOnClickFunc = searchBtnOnClick.bind(this);
      searchBtnOnClickFunc();
    });

    $(document).on("change", ".reportsSwitch", function () {
      reportsSwitchOnChangeFunc = reportsSwitchOnChange.bind(this);
      reportsSwitchOnChangeFunc();
    });

    // -----------------------Event Handlers-----------------------------
    function checkIndex() {
      //disables the prev and next buttons according to the page index
      if (pageIndex == 0) {
        $("#prevBtn").attr("disabled", true);
      } else {
        $("#prevBtn").attr("disabled", false);
      }
      if (pageIndex == splicedCardArray.length) {
        $("#nextBtn").attr("disabled", true);
      } else {
        $("#nextBtn").attr("disabled", false);
      }
    }

    function prevBtnOnClick() {
      //when prev button is clicked, the website loads the previous 15 coins
      checkedMap.clear();
      let tmp = [...cardArray];
      pageIndex--;
      $("#cards").html(tmp.splice(pageIndex * 15, 15));
    }

    function nextBtnOnClick() {
      // when next button is clicked, the website loads the next 15 coins
      checkedMap.clear();
      let tmp = [...cardArray];
      pageIndex++;
      $("#cards").html(tmp.splice(pageIndex * 15, 15));
    }

    async function infoBtnOnClick() {
      //display the info of the coin clicked
      $(`#${this.parentElement.parentElement.id}Btn`).attr("disabled", true); //disables multiple clicks
      await displayInfo(this.parentElement.parentElement, this);
      $(`#${this.parentElement.parentElement.id}Btn`).attr("disabled", false);
    }

    function searchBtnOnClick() {
      //search and display the coin inputted by the user
      let value = $("#search").val();
      value = `${value}Card`;
      let cards = $("#cards > div");
      cards.hide();
      let index = cardIdArray.indexOf(value);
      if (index != -1) {
        $("#cards").append(cardArray[index]);
      }
    }

    function reportsSwitchOnChange() {
      //validate toggle button on cards (max 5 switches toggled on)
      coinId = this.parentElement.parentElement.id;
      if (this.checked) {
        if (checkedMap.size < 5) {
          checkedMap.set(coinId, "true");
        } else {
          $(`#${this.id}`).prop("checked", false);
          alert("Please Remove One Of The Other Coins To Add Another To The Reports");
        }
      } else {
        //deletes the toggle switch from the checked map on user uncheck
        checkedMap.delete(coinId);
      }
    }
  } catch (error) {
    console.log(error);
  }
}

function addCard(coin) {
  //returns the bootstrap card html for the coin given
  let symbol = coin.symbol;

  // don't allow special characters (creates bugs in the website)
  symbol = symbol.replace(/\W/g, "");
  coin.symbol = symbol;

  let cardHtml = `<div id="${coin.symbol}Card" class="card text-white bg-dark">
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

async function displayInfo(elem, btn) {
  //this function is resposible for displaying the coin info inside the collapsable element
  let coinInfo;
  if (sessionStorage.getItem(`${elem.id}`) == "-1") {
    //if element was not already displayed create a new ajax request
    let coin = elem.id;
    $(`#${elem.id}Btn`).text("Loading...");
    coinInfo = await ajaxRequest(`https://api.coingecko.com/api/v3/coins/${coin}`);
    sessionStorage.setItem(`${elem.id}`, `${JSON.stringify(coinInfo)}`);
  } else {
    // draws the info from the cache instead of creating a new ajax request
    coinInfo = sessionStorage.getItem(`${elem.id}`);
    coinInfo = JSON.parse(coinInfo);
  }
  setInfo(btn, coinInfo); //set collapse info html
  $(`#${coinInfo.symbol}Collapse`).collapse("toggle"); //toggle collapsable element
}

function setInfo(elem, coinInfo) {
  // sets the info of the collapsable element inside the boostrap coin card
  let height = $(`#${coinInfo.symbol}Card`).height() > 180 ? "180px" : "370px";
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
