import path from "path";
import fs from 'fs';
import { TOKEN_MINT } from "../config/strategicSellingConfig";
import 'dotenv/config'

export const convertTimestampToReadableFormat = (timestamp) => {
    const date = new Date(timestamp);
  
    const options = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    };
  
    return date.toLocaleString('en-US', options as any);
};


export const parseTransactionShyft = async (txSig) => {
  const url = `https://api.shyft.to/sol/v1/transaction/parsed?network=mainnet-beta&txn_signature=${txSig}`;
  const myHeaders = new Headers();
  myHeaders.append("x-api-key", process.env.SHYFT_API_KEY );

  var requestOptions = {
    method: 'GET',
    headers: myHeaders,
    redirect: 'follow'
  };

  try {
    const response = await fetch( url , requestOptions as any);
    const result = await response.json();
    return result ;
  } catch (error) {
    console.error('Error:', error);
  }
}


export const parseTransaction = async (transaction) => {

    if( transaction?.type?.includes('SWAP') ) {
        const timestamp = convertTimestampToReadableFormat(transaction?.timestamp);
        const action = transaction?.actions[0] || [];
        let signature = transaction?.signatures[0]
        let buyOrSell : string;
        let tokenValue : number;
        let symbol : string;
        let feePayer : string = transaction?.fee_payer

        if(action?.info?.tokens_swapped?.in?.token_address == TOKEN_MINT){
            buyOrSell = 'SELL',
            symbol = (action?.info?.tokens_swapped?.in?.symbol)
            tokenValue = (action?.info?.tokens_swapped?.in?.amount); 
        }

        if(action?.info?.tokens_swapped?.out?.token_address == TOKEN_MINT){
            buyOrSell = 'BUY',
            symbol = (action?.info?.tokens_swapped?.out?.symbol)
            tokenValue = (action?.info?.tokens_swapped?.out?.amount); 
        }

        if(buyOrSell == 'SELL' || buyOrSell == 'BUY'){
            console.log(`Timestamp = `,timestamp)
            console.log(`Transasction = https://solscan.io/tx/${transaction?.signatures}`);
            console.log(`${buyOrSell} = ${tokenValue} ${symbol}`)
            console.log("\n")

            return {timestamp,buyOrSell,tokenValue,signature,symbol,feePayer}
        }else{
            console.log(`Timestamp = `,timestamp)
            console.log(`Transasction = https://solscan.io/tx/${transaction?.signatures}`);
            console.log("Arb")
            console.log("\n")
        }
    }else{
        const timestamp = convertTimestampToReadableFormat(transaction?.timestamp);
        console.log(`Timestamp = `,timestamp)
        console.log(`Transasction = https://solscan.io/tx/${transaction?.signatures}`);
        console.log(`Type = ${transaction?.type}`)
        console.log("\n")
    }

    return {}
}

export function getRandomNumberInRange(min, max) {
    if (min > max) {
        throw new Error("Minimum value must be less than or equal to the maximum value.");
    }

    return Math.floor(Math.random() * (max - min + 1)) + min;
}


export const logTransaction = ( transaction , name ) => {
  const logFilePath = path.join(__dirname , `${name}.json`)
  let transactions = [];

  if(fs.existsSync(logFilePath)){
      const data = fs.readFileSync(logFilePath , 'utf8');
      transactions = JSON.parse(data);
  }

  transactions.push(transaction);
  fs.writeFileSync(logFilePath , JSON.stringify(transactions,null,2) ,'utf8')
}
