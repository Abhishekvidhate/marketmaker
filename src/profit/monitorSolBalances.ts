import { getSolanaBalance, readExclusiveTokenHolders, getBalanceOfToken, getMultipleAccountsSolanaBalance, getTokenDecimals, delay } from "../utils/utils"
import 'dotenv/config';
import { buyToken } from "../buyToken";
import { TOKEN_ADDRESS } from "../config/consts";
import { Keypair } from "@solana/web3.js";
import bs58 from "bs58";
import { SolBalanceObject } from "../types";
import OpenTrades from "../models/opentrades";


const userWalletPublicKey = process.env.WALLET_PUBLIC_KEY || 'YOUR_PUBLIC_KEY';
const tokenAddress = TOKEN_ADDRESS
const primaryWallet = Keypair.fromSecretKey(bs58.decode(process.env.WALLET_PRIVATE_KEY || ''));

export async function monitorWalletsForSolanaPurchase(){

    const decimals = await getTokenDecimals(tokenAddress);

    while (true) {
        
        const exclusiveHolders = await readExclusiveTokenHolders();

        if (exclusiveHolders.length == 0) {
            console.log("Waiting for exclusive holders to get generated...");
            console.clear()
            continue;
        }

        const initialBalances: SolBalanceObject = exclusiveHolders.reduce( (acc, holder) => {
            acc[holder.walletAddress] = {
                sol: holder.solBalance
            };
            return acc;
        }, {} as SolBalanceObject);


        console.log("MONITORING....");

        const walletAddresses = exclusiveHolders.map(exclusiveHolder => exclusiveHolder.walletAddress) ;
        const currentBalances = await getMultipleAccountsSolanaBalance(walletAddresses) 

        for (const wallet of walletAddresses) {

            const currentBalance = currentBalances[wallet].sol;

            if (currentBalance > initialBalances[wallet].sol) {
                console.log(`SOL added to wallet ${wallet}. Initiating token purchase.`);

                //WE BUY THE TOKEN HERE
                const solanaToBuy = Math.floor(currentBalance * 0.6) ;
                const userSolanaBalance = await getSolanaBalance(userWalletPublicKey) ;
                
                if (userSolanaBalance > solanaToBuy && currentBalance > solanaToBuy && (currentBalance-initialBalances[wallet].sol) > 1 ) {
                    
                    try {
                        const tokenToSell = (await buyToken(primaryWallet,tokenAddress,solanaToBuy,false,true) as number) / 10 ** decimals ;
                        const initialTokenBalance = await getBalanceOfToken(wallet, tokenAddress);

                        await OpenTrades.create({
                            walletAddress: wallet,
                            solBalance: currentBalance,
                            tokenBalance: initialTokenBalance,
                            openTradeType: 'SELL',
                            tokenAmount: tokenToSell,
                            solAmount: solanaToBuy,
                            timeStamp : new Date().getTime()
                        })
                        
                    } catch (err) {
                        console.log("Error in Swaping", err)
                        process.exit()
                    }

                }

                initialBalances[wallet].sol = currentBalance;
            }
        }

        await delay(200)
        console.clear()

    }
}


monitorWalletsForSolanaPurchase();


