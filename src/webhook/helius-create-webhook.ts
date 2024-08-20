import 'dotenv/config'

const createWebhook = async () => {
    try {
      const response = await fetch(
        `https://api.helius.xyz/v0/webhooks?api-key=${process.env.HELIUS_API_KEY}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
          "webhookURL": "https://p8gmdtms-4786.inc1.devtunnels.ms/webhook/",
          "transactionTypes": ["Any"],
          "accountAddresses": ["CTg3ZgYx79zrE1MteDVkmkcGniiFrK1hJ6yiabropump"],
          "webhookType": "enhanced", // "rawDevnet"
          "txnStatus": "success", // success/failed
       }),
        }
      );
      const data = await response.json();
      console.log({ data });
    } catch (e) {
      console.error("error", e);
    }
};

createWebhook();