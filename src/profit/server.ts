import express from 'express'
import { parseTransactionHeliusSwap, parseTransactionHeliusTransfer, parseTransactionResult, parseTransactionShyft } from '../utils/controllers';
import { checkExclusiveTokenHolder, getTokenDecimals } from '../utils/utils';
import { BASE_AMOUNT, SOL_BASE_AMOUNT, TOKEN_MINT, TOKEN_SYMBOL } from '../config/profitConfig';
import mongoose from 'mongoose';
import SplitTokenHolders from '../models/splittokenholders';
import OpenTrades from '../models/opentrades';
import ExclusiveHolders from '../models/exclusiveholders';
import { buyToken } from '../buyToken';
import { Keypair } from '@solana/web3.js';
import bs58 from "bs58";



const app = express()
const port = 3002;
const primaryWallet = Keypair.fromSecretKey(bs58.decode(process.env.WALLET_PRIVATE_KEY || ''));


//Connection
mongoose
.connect('mongodb://127.0.0.1:27017/market-maker-bot')
.then( () => console.log("Mongo Connected"))
.catch( err => console.log("Mongo Error" , err))


app.post('/webhook', (req, res) => {

    const transactions = req.body;

    transactions.forEach(async (transaction) => {

        if (transaction?.type == "TRANSFER" && transaction?.description) {
            const result = await parseTransactionHeliusTransfer(transaction);
            const exclusiveHolder = await checkExclusiveTokenHolder(TOKEN_MINT, result.toAccount);

            if(exclusiveHolder && result.tokenTransferred > BASE_AMOUNT) {
                
                //sell the token here

                await SplitTokenHolders.create({
                  walletAddress: result.toAccount,
                  tokenAddress: TOKEN_MINT,
                  tokenTransferred: result.tokenTransferred,
                  signature: `https://solscan.io/tx/${transaction.signature}`,
                })
            }
        }

        if (transaction?.type == "SWAP" && transaction?.description) {
            const result = await parseTransactionHeliusSwap(transaction,TOKEN_SYMBOL);
            const exclusiveHolder = await checkExclusiveTokenHolder(TOKEN_MINT, result.feePayer);

            if(exclusiveHolder && exclusiveHolder.solBalance > SOL_BASE_AMOUNT){
            
                //buy the token here 
                const solanaToBuy = 0.1;
                const decimals = await getTokenDecimals(TOKEN_MINT);

                const tokenToSell = (await buyToken(primaryWallet,TOKEN_MINT,solanaToBuy,false,true) as number) / 10 ** decimals ;


                await OpenTrades.create({
                    walletAddress: result.feePayer,
                    solBalance: exclusiveHolder.solBalance,
                    tokenBalance: exclusiveHolder.tokenBalance,
                    openTradeType: 'SELL',
                    tokenAmount: tokenToSell,
                    solAmount : solanaToBuy,
                    timeStamp : new Date().getTime(),
                })
                await ExclusiveHolders.updateOne({walletAddress : result.feePayer} , {$set : {openTrade : true}})
            }
        }

        if (transaction?.type == "UNKNOWN" && transaction?.description) {
            const parsedTransaction = await parseTransactionShyft(transaction?.signature);
            const result = parseTransactionResult(parsedTransaction?.result);


            if(result){
                const exclusiveHolder = await checkExclusiveTokenHolder(TOKEN_MINT, result.feePayer);

                if(exclusiveHolder && exclusiveHolder.solBalance > SOL_BASE_AMOUNT){
            
                    //buy the token here 
                    const solanaToBuy = 0.1;
                    const decimals = await getTokenDecimals(TOKEN_MINT);
    
                    const tokenToSell = (await buyToken(primaryWallet,TOKEN_MINT,solanaToBuy,false,true) as number) / 10 ** decimals ;
    
    
    
                    await OpenTrades.create({
                        walletAddress: result.feePayer,
                        solBalance: exclusiveHolder.solBalance,
                        tokenBalance: exclusiveHolder.tokenBalance,
                        openTradeType: 'SELL',
                        tokenAmount: tokenToSell,
                        solAmount : solanaToBuy,
                        timeStamp : new Date().getTime()
                    })
                    await ExclusiveHolders.updateOne({walletAddress : result.feePayer} , {$set : {openTrade : true}})
                }
            } 
        }


    })

})
