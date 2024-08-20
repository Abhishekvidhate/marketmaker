import 'dotenv/config'

const myHeaders = new Headers();
myHeaders.append("x-api-key", process.env.SHYFT_API_KEY);

const requestOptionsGetCallback = {
  method: 'GET',
  headers: myHeaders,
  redirect: 'follow'
};

async function getCallback() {
    await fetch("https://api.shyft.to/sol/v1/callback/list", requestOptionsGetCallback as any)
  .then(response => response.text())
  .then(result => console.log(result))
  .catch(error => console.log('error', error));

}

getCallback()
