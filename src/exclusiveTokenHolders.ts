import { TOKEN_ADDRESS } from "./config/consts";
import { checkExclusiveTokenHolders, getExclusiveTokenHolders, getTokenAccounts, readTokenHolders } from "./utils/utils";

async function updateExclusiveTokenHolders() {
  const oldTokenHolders = readTokenHolders();
  await getTokenAccounts(TOKEN_ADDRESS);
  const newTokenHolders = readTokenHolders();
  const set = new Set(oldTokenHolders);
  const filterTokenHolders = newTokenHolders.filter(item => !set.has(item));
  if(filterTokenHolders.length > 0){
    await checkExclusiveTokenHolders(TOKEN_ADDRESS , filterTokenHolders)
  }else{
    console.log("No New Exclusive Token Holders....")
  }
}

async function exclusiveTokenHolders() {
    console.log("Fetching Exclusive Holders...")
    try {
      await getExclusiveTokenHolders(TOKEN_ADDRESS);
      setInterval(async () => {
        console.clear();
        console.log("Fetching Exclusive Holders AGAIN...")
        await updateExclusiveTokenHolders();
      }, 60000 );
    } catch (error) {
      console.error('Error in startProcess:', error);
    }
}


exclusiveTokenHolders() ;
