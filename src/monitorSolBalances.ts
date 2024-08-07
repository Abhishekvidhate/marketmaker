import { getSolanaBalance, readExclusiveTokenHolders, getBalanceOfToken, getMultipleAccountsSolanaBalance, getTokenDecimals, delay } from "./utils/utils"
import 'dotenv/config';
import fs from 'fs'
import path from 'path'
import { buyToken } from "./buyToken";
import { TOKEN_ADDRESS } from "./config/consts";
import { Wallet } from "@project-serum/anchor";
import { Keypair } from "@solana/web3.js";
import bs58 from "bs58";



const userWalletPublicKey = process.env.WALLET_PUBLIC_KEY || 'YOUR_PUBLIC_KEY';
const tokenAddress = TOKEN_ADDRESS

export async function monitorWalletsForSolanaPurchase(){

    const primaryWallet = Keypair.fromSecretKey(bs58.decode(process.env.WALLET_PRIVATE_KEY || ''));
    const decimals = await getTokenDecimals(tokenAddress);
    const walletAddresses = readExclusiveTokenHolders();
    let startLengthWalletAddresses = walletAddresses.length;
    let initialBalances: { [key: string]: { sol: number } } = {};
    console.log("STARTED SAVING INITIAL BALANCE")
    initialBalances = await getMultipleAccountsSolanaBalance(walletAddresses)
    console.clear()
    console.log("SAVED INITIAL BALANCES") 

    while (true) {

        const walletAddresses = readExclusiveTokenHolders();
        if (walletAddresses.length == 0) {
            console.log("Waiting for exclusive holders to get generated...");
            console.clear()
            continue;
        }else if (walletAddresses.length > startLengthWalletAddresses) {
            console.log("Exclusive Holder file updated , updating their initial SOL Balances...")
            if(startLengthWalletAddresses == 0){
                initialBalances = await getMultipleAccountsSolanaBalance(walletAddresses)
            }else{
                for (const wallet of walletAddresses) {
                    if (!initialBalances[wallet]) {
                        initialBalances[wallet] = {
                            sol: await getSolanaBalance(wallet),
                        };
                    }
                }
            }
            startLengthWalletAddresses = walletAddresses.length;
            continue;
        }

        console.log("MONITORING....")
        const currentBalances = await getMultipleAccountsSolanaBalance(walletAddresses) 
        for (const wallet of walletAddresses) {
            const currentBalance = currentBalances[wallet].sol;
            if (currentBalance > initialBalances[wallet].sol) {
                console.log(`SOL added to wallet ${wallet}. Initiating token purchase.`);
                //WE BUY THE TOKEN HERE
                const solanaToBuy = 0.08;
                const userSolanaBalance = await getSolanaBalance(userWalletPublicKey);
                
                if (userSolanaBalance > solanaToBuy && currentBalance > solanaToBuy && (currentBalance-initialBalances[wallet].sol) > 0.005) {
                    try {
                        const tokenToSell = (await buyToken(primaryWallet,tokenAddress,solanaToBuy,false,true) as number) / 10 ** decimals ;
                        const initialTokenBalance = await getBalanceOfToken(wallet, tokenAddress);
                        const openTrade = {
                            walletAddress: wallet,
                            initialTokenBalance: initialTokenBalance,
                            timeOfTrade: new Date().getTime(),
                            tokenToSell: tokenToSell
                        }

                        const filePath = path.join(__dirname, "..", "./files/openTrades.json");
                        if (fs.existsSync(filePath)) {
                            try {
                                const data = fs.readFileSync(filePath, 'utf8');
                                let jsonData;
                                if (data.trim() === '') {
                                  jsonData = [];
                                } else {
                                  jsonData = JSON.parse(data);
                                }
                                jsonData.push(openTrade);
                                const updatedData = JSON.stringify(jsonData, null, 2);
                                fs.writeFileSync(filePath, updatedData, 'utf8');
                                console.log('Open Trade file has been updated');
                            } catch (err) {
                                console.error('Error reading or writing the Open Trade File:', err);
                            }
                        } else {
                            try {
                                const openTradeData = JSON.stringify([openTrade], null, 2);
                                fs.writeFileSync(filePath, openTradeData, 'utf8');
                                console.log('Open Trade file has been updated');
                            } catch (err) {
                                console.error('Error writing the Open Trade File:', err);
                            }
                        }

                        
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


