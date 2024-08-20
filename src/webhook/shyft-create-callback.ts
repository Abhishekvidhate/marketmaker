import 'dotenv/config'

var myHeadersCreateCallback = new Headers();
myHeadersCreateCallback.append("x-api-key", process.env.SHYFT_API_KEY);
myHeadersCreateCallback.append("Content-Type", "application/json");

var raw = JSON.stringify({
  "network": "mainnet-beta",
  "addresses": [
    "CTg3ZgYx79zrE1MteDVkmkcGniiFrK1hJ6yiabropump",
  ],
  "callback_url": "https://p8gmdtms-3001.inc1.devtunnels.ms/webhook/",
  "encoding" : "PARSED",
  "type": "CALLBACK",
  "enable_raw" : false,
  "enable_events" : true,
});

var requestOptionsCreateCallback = {
  method: 'POST',
  headers: myHeadersCreateCallback,
  body: raw,
  redirect: 'follow'
};

fetch("https://api.shyft.to/sol/v1/callback/create", requestOptionsCreateCallback as any)
  .then(response => response.text())
  .then(result => console.log(result))
  .catch(error => console.log('error', error));