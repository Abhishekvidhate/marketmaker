import 'dotenv/config'

const myHeader = new Headers();
myHeader.append("x-api-key", process.env.SHYFT_API_KEY);
myHeader.append("Content-Type", "application/json");

var raw = JSON.stringify({
    "id": "66b9dd1cbc6d6966f86e2485"
});

const requestOptions = {
  method: 'DELETE',
  headers: myHeader,
  body: raw,
  redirect: 'follow'
};

fetch("https://api.shyft.to/sol/v1/callback/remove", requestOptions as any)
  .then(response => response.text())
  .then(result => console.log(result))
  .catch(error => console.log('error', error));