import express from 'express'
import bodyParser from 'body-parser'
import { getRandomNumberInRange, logTransaction, parseTransaction, parseTransactionShyft } from './controllers';
import { BASE_AMOUNT, SMALL_AMOUNT, TIME_INTERVAL, TOKEN_MINT } from '../config/strategicSellingConfig';
import { Keypair } from '@solana/web3.js';
import bs58 from "bs58";
import { sellToken } from '../sellToken';


const app = express();
const port = 4786;
let totalBuy = 0;
let totalSell = 0;
const primaryWallet = Keypair.fromSecretKey(bs58.decode(process.env.WALLET_PRIVATE_KEY || ''));


app.use(bodyParser.json());

app.get('/', (req, res) => {
    res.send("Hey")
})

app.post('/webhook', (req, res) => {

    const transactions = req.body;
    logTransaction( transactions, 'full-transaction')

    transactions.forEach( async (transaction) => {
        const parsedTransaction: any = await parseTransactionShyft(transaction.signature);
        const result = await parseTransaction(parsedTransaction.result);
        logTransaction(result , 'parse-transaction')
        result.buyOrSell == 'BUY' ? (totalBuy += result.tokenValue) : (totalSell += result.tokenValue) ;

        if(result.buyOrSell == 'BUY' && result.tokenValue > BASE_AMOUNT && result?.feePayer == '6CQxNkZNnGcN3RaNG35uA9Qw6M9kzevUb5sgfewsi9nT' ){
            //sell 50-70% of BUY AMOUNT
            const randomPercentage = getRandomNumberInRange(50,70);
            const tokenToSell = (randomPercentage/100)*result.tokenValue ;
            const primaryWallet = Keypair.fromSecretKey(bs58.decode(process.env.WALLET_PRIVATE_KEY || ''));
            await sellToken(primaryWallet,false,TOKEN_MINT,false,tokenToSell)
        }

        // if( (totalBuy-totalSell) > BASE_AMOUNT ){
        //     const randomPercentage = getRandomNumberInRange(50,70);
        //     const tokenToSell = (randomPercentage/100)*BASE_AMOUNT ;
        //     await sellToken(primaryWallet,false,TOKEN_MINT,false,tokenToSell);
        // }

        // setInterval( async () => {
        //     console.log(`Selling ${SMALL_AMOUNT} ${result.symbol}`)
        //     await sellToken(primaryWallet,false,TOKEN_MINT,false,SMALL_AMOUNT);
        // }, TIME_INTERVAL )
    })

res.sendStatus(200);

});

app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});


