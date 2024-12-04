const crypto = require("crypto");
require("dotenv").config();

async function getTickerPrice(symbol) {
  try {
    const priceFetch = await fetch(
      "http://api.binance.com/api/v3/ticker/price?symbol=" + symbol
    );
    const priceBody = await priceFetch.json();

    return parseFloat(priceBody.price);
  } catch (error) {
    console.log("Error: ", error);
    throw error;
  }
}

async function makeTrade(symbol, price, action, quantity) {
  try {
    const apiKey = process.env.API_KEY;
    const apiSecret = process.env.API_SECRET;
    const endpoint = "https://api.binance.com/api/v3/order";
    const timestamp = Date.now();
    const params = {
      price,
      quantity,
      side: action,
      symbol,
      timeInForce: "GTC",
      timestamp,
      type: "LIMIT",
    };

    let queryString = new URLSearchParams(params).toString();
    const signature = crypto
      .createHmac("sha256", apiSecret)
      .update(queryString)
      .digest("hex");

    queryString += "&signature=" + signature;

    const url = endpoint + "?" + queryString;

    const request = await fetch(url, {
      method: "POST",
      headers: {
        "X-MBX-APIKEY": apiKey,
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    const response = await request.json();

    return response;
  } catch (error) {
    console.log("Error: ", error);
    throw error;
  }
}

(async () => {
  const symbol = "SHIBUSDT";
  const price = await getTickerPrice(symbol);
  const action = "BUY"; // SELL
  const quantity = Math.round(5 / price);

  const transaction = await makeTrade(symbol, price, action, quantity);
  console.log("Transaction: ", transaction);
})();
