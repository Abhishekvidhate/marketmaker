const createWebhook = async () => {
    try {
      const response = await fetch(
        "https://api.helius.xyz/v0/webhooks?api-key=488ae56c-5553-4dbc-95e8-eb5a3dffba85",
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
          "webhookURL": "https://p8gmdtms-4786.inc1.devtunnels.ms/webhook/",
          "transactionTypes": ["Any"],
          "accountAddresses": ["4Cnk9EPnW5ixfLZatCPJjDB1PUtcRpVVgTQukm9epump"],
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