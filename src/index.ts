import * as readline from 'readline';
import {getExclusiveTokenHolders,readExclusiveTokenHolders , getTokenBalance} from "./utils"
import {monitorWalletsForSolanaPurchase} from "./monitor"

async function startProcess() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  const getTokenAddress = (): Promise<string> => {
    return new Promise((resolve) => {
      rl.question('Please enter the token address: ', (tokenAddress) => {
        resolve(tokenAddress);
        rl.close();
      });
    });
  };

  try {
    const tokenAddress = await getTokenAddress();
    await getExclusiveTokenHolders(tokenAddress);

    const tokenHolders = readExclusiveTokenHolders();
    console.log("Token Holders" , tokenHolders)
    monitorWalletsForSolanaPurchase(tokenHolders , tokenAddress);

    setInterval(async () => {
      await getExclusiveTokenHolders(tokenAddress);
      const updatedTokenHolders = readExclusiveTokenHolders();
      monitorWalletsForSolanaPurchase(updatedTokenHolders,tokenAddress);
    }, 3600000);
  } catch (error) {
    console.error('Error in startProcess:', error);
  }

}

startProcess();


