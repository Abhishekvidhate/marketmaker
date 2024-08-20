import { delay, getBalanceOfToken, readOpenTrades } from "../utils/utils";
import 'dotenv/config';
import { TOKEN_ADDRESS } from "../config/consts";
import { sellToken } from "../sellToken";
import { Keypair, LAMPORTS_PER_SOL } from "@solana/web3.js";
import bs58 from "bs58";
import FinishTrades from "../models/finishtrades";
import OpenTrades from "../models/opentrades";
import { IOpenTrade } from "../types";

const tokenAddress = TOKEN_ADDRESS;
const primaryWallet = Keypair.fromSecretKey(bs58.decode(process.env.WALLET_PRIVATE_KEY || ''));

async function processTrade(trade : IOpenTrade) {
    const currentTokenBalance = await getBalanceOfToken(trade.walletAddress, tokenAddress);

    if (currentTokenBalance > trade.tokenBalance) {
        console.log(`Token purchased by ${trade.walletAddress}. Selling token.`);
        await sellAndRecordTrade(trade, 'Token purchased and sold');
    } else if ((Date.now() - trade.timeStamp) > 3600000) {
        console.log("Open Trade Expired, Selling Token");
        await sellAndRecordTrade(trade, 'Open Trade Time Expired, Sold Token');
    }
}

async function sellAndRecordTrade(trade, description) {
    try {
        const amountOfSolIn = (await sellToken(primaryWallet, false, tokenAddress, false, true, trade.tokenAmount) as number) / LAMPORTS_PER_SOL;

        await FinishTrades.create({
            walletAddress: trade.walletAddress,
            initialAmount: trade.solAmount,
            finalAmount: amountOfSolIn,
            profitOrLoss: amountOfSolIn > trade.solAmount ? 'Profit' : 'Loss',
            description
        });

        await OpenTrades.deleteOne({ walletAddress: trade.walletAddress });
        console.log('Open Trade file has been updated');
    } catch (err) {
        console.error("Error in selling token or updating database:", err);
    }
}

async function monitorWalletsForTokenPurchase() {
    while (true) {
        try {
            const openTrades = await readOpenTrades();
            if (openTrades.length === 0) {
                console.log("No Open Trades...");
                await delay(1000);
                continue;
            }

            for (let i = 0; i < openTrades.length; i++) {
                await processTrade(openTrades[i]);

                if (global.gc) {
                    global.gc();
                }

                await delay(100);
            }

            console.clear();

        } catch (error) {
            console.error("An error occurred:", error);
            await new Promise(resolve => setTimeout(resolve, 5000));
        }
    }
}

process.on('SIGINT', () => {
    console.log('Gracefully shutting down...');
    process.exit(0);
});

// Run with --expose-gc flag to enable manual garbage collection
monitorWalletsForTokenPurchase().catch(console.error);
