import { delay, getBalanceOfToken, readOpenTrades } from "./utils/utils"
import 'dotenv/config';
import fs from 'fs'
import path from 'path'
import { TOKEN_ADDRESS } from "./config/consts";
import { sellToken } from "./sellToken";
import { Keypair } from "@solana/web3.js";
import bs58 from "bs58";



const solAddress = process.env.SOL_ADDRESS || "So11111111111111111111111111111111111111112";
const userWalletPublicKey = process.env.WALLET_PUBLIC_KEY || 'YOUR_PUBLIC_KEY';
const tokenAddress = TOKEN_ADDRESS


export async function monitorWalletsForTokenPurchase() {

    const primaryWallet = Keypair.fromSecretKey(bs58.decode(process.env.WALLET_PRIVATE_KEY || ''));

    while (true) {
        const openTrades = readOpenTrades();
        if (openTrades.length == 0) {
            console.log("No Open Trades...");
            await delay(1000);
            console.clear()
            continue;
        }

        for (let i = 0; i < openTrades.length; i++) {
            console.log("Monitoring Open Trades...");
            const currentTokenBalance = await getBalanceOfToken(openTrades[i].walletAddress, tokenAddress)
            if (currentTokenBalance > openTrades[i].initialTokenBalance) {
                console.log(`Token purchased by ${openTrades[i].walletAddress}. Selling token.`);
                try {
                    await sellToken(primaryWallet,false,tokenAddress,false,openTrades[i].tokenToSell)

                    const successTrades = {
                        walletAddress: openTrades[i].walletAddress,
                    }

                    const pathOfSuccessTrades = path.join(__dirname, "..", "./files/successTrades.json");
                    if (fs.existsSync(pathOfSuccessTrades)) {
                        try {
                            const data = fs.readFileSync(pathOfSuccessTrades, 'utf8');
                            let jsonData;
                            if (data.trim() === '') {
                              jsonData = [];
                            } else {
                              jsonData = JSON.parse(data);
                            }
                            jsonData.push(successTrades);
                            const updatedData = JSON.stringify(jsonData, null, 2);
                            fs.writeFileSync(pathOfSuccessTrades, updatedData, 'utf8');
                            console.log('Success Trade file has been updated');
                        } catch (err) {
                            console.error('Error reading or writing the Success Trade File:', err);
                        }
                    } else {
                        try {
                            const openTradeData = JSON.stringify([successTrades], null, 2);
                            fs.writeFileSync(pathOfSuccessTrades, openTradeData, 'utf8');
                            console.log('Success Trade file has been updated');
                        } catch (err) {
                            console.error('Error writing the Success Trade File:', err);
                        }
                    }

                    const filePath = path.join(__dirname, '..', './files/openTrades.json');
                    try {
                        const data = fs.readFileSync(filePath, 'utf8');
                        let openTrade = JSON.parse(data);
                        openTrade.splice(i, 1);
                        const updatedOpenTrade = JSON.stringify(openTrade, null, 2);
                        fs.writeFileSync(filePath, updatedOpenTrade, 'utf8');
                        console.log('Open Trade file has been updated');
                    } catch (err) {
                        console.error('Error reading or writing the Open Trade File:', err);
                    }


                } catch (err) {
                    console.log("Error in selling token.", err)
                }
            } else if ((new Date().getTime() - openTrades[i].timeOfTrade) > 3600000) {
                console.log("Open Trade Expired , Selling Token");
                try {
                    await sellToken(primaryWallet,false,tokenAddress,false,openTrades[i].tokenToSell)

                    const failTrades = {
                        walletAddress: openTrades[i].walletAddress,
                    }

                    const pathOfFailTrades = path.join(__dirname, "..", "./files/failTrades.json");
                    if (fs.existsSync(pathOfFailTrades)) {
                        try {
                            const data = fs.readFileSync(pathOfFailTrades, 'utf8');
                            let jsonData;
                            if (data.trim() === '') {
                              jsonData = [];
                            } else {
                              jsonData = JSON.parse(data);
                            }
                            jsonData.push(failTrades);
                            const updatedData = JSON.stringify(jsonData, null, 2);
                            fs.writeFileSync(pathOfFailTrades, updatedData, 'utf8');
                            console.log('Fail Trade file has been updated');
                        } catch (err) {
                            console.error('Error reading or writing the Fail Trade File:', err);
                        }
                    } else {
                        try {
                            const openTradeData = JSON.stringify([failTrades], null, 2);
                            fs.writeFileSync(pathOfFailTrades, openTradeData, 'utf8');
                            console.log('Fail Trade file has been updated');
                        } catch (err) {
                            console.error('Error writing the Fail Trade File:', err);
                        }
                    }

                    const filePath = path.join(__dirname, '..', './files/openTrades.json');
                    try {
                        const data = fs.readFileSync(filePath, 'utf8');
                        let openTrade = JSON.parse(data);
                        openTrade.splice(i, 1);
                        const updatedOpenTrade = JSON.stringify(openTrade, null, 2);
                        fs.writeFileSync(filePath, updatedOpenTrade, 'utf8');
                        console.log('Open Trade file has been updated');
                    } catch (err) {
                        console.error('Error reading or writing the Open Trade File:', err);
                    }
                } catch (err) {
                    console.log("Error in selling token.", err)
                }

            }
        }
        console.clear()
    }
}

monitorWalletsForTokenPurchase()