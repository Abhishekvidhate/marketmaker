const myHeader = new Headers();
myHeader.append("x-api-key", "rj3Zg8rx0PSWTPZt");
myHeader.append("Content-Type", "application/json");

var raw = JSON.stringify({
    "id": "66b0f7a739be5a366f6e62d8"
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