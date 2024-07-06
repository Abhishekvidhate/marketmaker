import { swap } from "./swap";
import {getSolanaBalance,getTokenBalance} from "./utils"
import 'dotenv/config';

const solAddress = process.env.SOL_ADDRESS || "So11111111111111111111111111111111111111112" ;

export async function monitorWalletsForSolanaPurchase(walletAddresses: string[],tokenAddress:string, checkInterval = 2000) {
    const initialBalances: { [key: string]: { sol: number } } = {};

    for (const wallet of walletAddresses) {
        initialBalances[wallet] = {
            sol: await getSolanaBalance(wallet),
        };
    }

    console.log("Now we monitor wallets if they add SOL every 2 sec.")

    setInterval(async () => {
        for (const wallet of walletAddresses) {
            const currentBalance = await getSolanaBalance(wallet);
            console.log(`Current Balance = ${currentBalance/1000000000} & Initial Balance = ${initialBalances[wallet].sol/1000000000}`)
            if (currentBalance > initialBalances[wallet].sol ) {
                console.log(`SOL added to wallet ${wallet}. Initiating token purchase.`);
                //WE BUY THE TOKEN HERE
                const amountToBuy = (currentBalance-initialBalances[wallet].sol)/1000000000 ;
                swap(amountToBuy,solAddress,tokenAddress);
                const initialTokenBalance = await getTokenBalance(wallet)
                monitorWalletsForTokenPurchase(wallet,tokenAddress,initialTokenBalance);
            }
            initialBalances[wallet].sol = currentBalance;
        }
    },checkInterval);
}

export async function monitorWalletsForTokenPurchase(walletAddress: string,tokenAddress:string, initialTokenBalance: number) {
    const startTime = Date.now();
    const checkInterval = 2000;
    let currentTokenBalance: number;

    const checkForTokenPurchase = async () => {
        currentTokenBalance = await getTokenBalance(walletAddress);
        console.log("initialTokenBalance", initialTokenBalance)
        console.log("currentTokenBalance", currentTokenBalance)
        if (currentTokenBalance > initialTokenBalance) {
            console.log(`Token purchased by ${walletAddress}. Selling token.`);
            // WE SELL OUR TOKEN HERE
            const amountToBuy : number = currentTokenBalance - initialTokenBalance ;
            swap(amountToBuy,tokenAddress,solAddress)
            return true;
        }
        return false;
    };

    const intervalId = setInterval(async () => {
        const tokenPurchased = await checkForTokenPurchase();

        if (tokenPurchased || Date.now() - startTime >= 3600000) {
            if (!tokenPurchased) {
                console.log(`Token not purchased by ${walletAddress} within 1 hour. Selling token.`);
                // WE SELL OUR TOKEN BECAUSE OF TIME LIMIT REACHED.
                const amountToBuy : number = currentTokenBalance - initialTokenBalance ;
                swap(amountToBuy,tokenAddress,solAddress)
            }
            clearInterval(intervalId);
        }
    }, checkInterval);
}
