var myHeadersCreateCallback = new Headers();
myHeadersCreateCallback.append("x-api-key", "rj3Zg8rx0PSWTPZt");
myHeadersCreateCallback.append("Content-Type", "application/json");

var raw = JSON.stringify({
  "network": "mainnet-beta",
  "addresses": [
    "4Cnk9EPnW5ixfLZatCPJjDB1PUtcRpVVgTQukm9epump",
  ],
  "callback_url": "https://p8gmdtms-3001.inc1.devtunnels.ms/webhook/",
  "encoding" : "PARSED",
  "type": "CALLBACK",
  "enable_raw" : true,
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