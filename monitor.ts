import {getSolanaBalance,getTokenBalance} from "./utils"
require("dotenv").config();
const apiKey = process.env.HELIUS_API_KEY;

export async function monitorWalletsForSolana(walletAddresses: string[], checkInterval = 10000) {
    const initialBalances: { [key: string]: { sol: number; token: number } } = {};

    for (const wallet of walletAddresses) {
        initialBalances[wallet] = {
            sol: await getSolanaBalance(wallet),
            token: await getTokenBalance(wallet),
        };
    }

    setInterval(async () => {
        for (const wallet of walletAddresses) {
            const currentBalance = await getSolanaBalance(wallet);
            if (currentBalance > initialBalances[wallet].sol) {
                console.log(`SOL added to wallet ${wallet}. Initiating token purchase.`);
                //WE BUY THE TOKEN HERE 
                monitorTokenPurchase(wallet, initialBalances[wallet].token);
            }

            initialBalances[wallet].sol = currentBalance;
        }
    }, checkInterval);
}

export async function monitorTokenPurchase(walletAddress: string, initialTokenBalance: number) {
    const url = `https://mainnet.helius-rpc.com/?api-key=${apiKey}`;
    const startTime = Date.now();
    const checkInterval = 10000;

    const checkForTokenPurchase = async () => {
        const currentTokenBalance = await getTokenBalance(walletAddress);
        console.log("initialTokenBalance", initialTokenBalance)
        console.log("currentTokenBalance", currentTokenBalance)
        if (currentTokenBalance > initialTokenBalance) {
            console.log(`Token purchased by ${walletAddress}. Selling token.`);
            // WE SELL OUR TOKEN HERE 
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
            }
            clearInterval(intervalId);
        }
    }, checkInterval);
}
