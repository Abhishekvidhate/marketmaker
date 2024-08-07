import express from 'express'
import bodyParser from 'body-parser'
import fs from 'fs'
import path from 'path'

const app = express();
const port = 4786;

app.use(bodyParser.json());

app.get('/' , (req,res) => {
    res.send("Hey")
})

app.post('/webhook',   
    (req, res) => {

    const webhookData = req.body;
    logTransaction(webhookData , "tarnsactions")
    
    // webhookData.forEach( ( transaction: any) => {
    //     const currentPriceUsdc = transaction.priceUsdc;
            
    //     if (previousPriceUsdc !== null) {
    //         const priceImpact = ((currentPriceUsdc - previousPriceUsdc) / previousPriceUsdc) * 100;
    //         console.log(`Transaction ID: https://solscan.io/tx/${transaction.transactionId}`);
    //         console.log(`Price Impact: ${priceImpact.toFixed(2)}%`);
    //         console.log('\n')
    //     } else {
    //         console.log(`Transaction ID: https://solscan.io/tx/${transaction.transactionId}`);
    //         console.log(`No previous transaction to compare for price impact.`);
    //         console.log('\n')

    //     }
    //     previousPriceUsdc = currentPriceUsdc;
    // });
    //  console.log(webhookData); // Log the incoming webhook data
     // Process the webhook data as needed (e.g., store in a database, send notifications)

         webhookData.forEach( ( transaction: any) => {
            const result = {
                transactionId: '',
                type: ''
            } ;
            console.log(`Transaction ID: https://solscan.io/tx/${transaction.signature}`);
            console.log(`Type: ${transaction.type}`);
            result.transactionId = `https://solscan.io/tx/${transaction.signature}`
            result.type = `${transaction.type}`
            logTransaction(result , "tarnsactionID")
            console.log('\n')
        })

     res.sendStatus(200);
   });
   
app.listen(port, () => {
     console.log(`Server listening on port ${port}`);
});

const logTransaction = (transaction , name) => {
    const logFilePath = path.join(__dirname , `${name}.json`)
    let transactions = [];
    if(fs.existsSync(logFilePath)){
        const data = fs.readFileSync(logFilePath , 'utf8');
        transactions = JSON.parse(data);
    }
    transactions.push(transaction);
    fs.writeFileSync(logFilePath , JSON.stringify(transactions,null,2) ,'utf8')
}
