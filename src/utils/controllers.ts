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
  myHeaders.append("x-api-key", process.env.SHYFT_API_KEY);

  var requestOptions = {
    method: 'GET',
    headers: myHeaders,
    redirect: 'follow'
  };

  try {
    const response = await fetch(url, requestOptions as any);
    const result = await response.json();
    return result;
  } catch (error) {
    console.log('Error Parsing transaction Shyft :- ', error);
  }
}

export const parseTransactionResult = (transaction) => {
  if (transaction?.type?.includes('SWAP')) {
    const action = transaction?.actions[0] || [];
    let signature = transaction?.signatures[0]
    let buyOrSell: string;
    let tokenValue: number;
    let symbol: string;
    let feePayer: string = transaction?.fee_payer

    if (action?.info?.tokens_swapped?.in?.token_address == TOKEN_MINT) {
      buyOrSell = 'SELL',
        symbol = (action?.info?.tokens_swapped?.in?.symbol)
      tokenValue = (action?.info?.tokens_swapped?.in?.amount);
    }

    if (action?.info?.tokens_swapped?.out?.token_address == TOKEN_MINT) {
      buyOrSell = 'BUY',
        symbol = (action?.info?.tokens_swapped?.out?.symbol)
      tokenValue = (action?.info?.tokens_swapped?.out?.amount);
    }

    if (buyOrSell == 'SELL' || buyOrSell == 'BUY') {
      console.log(`Transasction = https://solscan.io/tx/${transaction?.signatures}`);
      console.log(`${buyOrSell} = ${tokenValue} ${symbol}`)
      console.log("\n")

      return { buyOrSell, tokenValue, signature, symbol, feePayer }
    } else {
      console.log(`Transasction = https://solscan.io/tx/${transaction?.signatures}`);
      console.log("Arb")
      console.log("\n")
    }
  } else {
    console.log(`Transasction = https://solscan.io/tx/${transaction?.signatures}`);
    console.log(`Type = ${transaction?.type}`)
    console.log("\n")
  }

  return null
}

export async function parseTransactionHeliusSwap(transaction, tokenSymbol) {
  const description = transaction?.description;
  const match = description.match(/(\d+(\.\d+)?)\s+(\w+)\s+for\s+(\d+(\.\d+)?)\s+(\w+)/);

  if (match) {
    const amountSold = parseFloat(match[1]);
    const tokenSold = match[3];
    const amountBought = parseFloat(match[4]);
    const tokenBought = match[6];

    if (tokenSold == tokenBought) {
      console.log(`Transasction = https://solscan.io/tx/${transaction?.signature}`);
      console.log(`Arb`)
      console.log("\n")
      return
    }

    if (tokenSold != tokenSymbol && tokenBought != tokenSymbol) {
      console.log(`Transasction = https://solscan.io/tx/${transaction?.signature}`);
      console.log(`No Buy & Sell`)
      console.log("\n")
      return
    }

    let buyOrSell;
    let tokenValue;
    let signature = transaction?.signature;
    let feePayer = transaction?.feePayer;

    if (tokenSymbol === tokenSold) {
      buyOrSell = 'SELL';
      tokenValue = amountSold;
    } else if (tokenSymbol === tokenBought) {
      buyOrSell = 'BUY';
      tokenValue = amountBought;
    } else {
      buyOrSell = 'unknown';
    }

    console.log(`Transasction = https://solscan.io/tx/${transaction?.signature}`);
    console.log(`${buyOrSell} = ${tokenValue} ${tokenSymbol}`)
    console.log("\n")

    return {
      feePayer,
      tokenSymbol,
      signature,
      tokenValue,
      buyOrSell,
    };
  }
  return null;
}

export async function parseTransactionHeliusTransfer(transaction) {
  const description = transaction?.description;
  const parts = description.split(' ');

  if(parts){
    const fromAccount = parts[0];
    const tokenTransferred = parseFloat(parts[1]);
    let toAccount = parts[4];
  
    toAccount = toAccount.endsWith('.') ? toAccount.slice(0, -1) : toAccount;
  
    return {
      fromAccount,
      tokenTransferred,
      toAccount
    };
  }
  return null;
}

export function getRandomNumberInRange(min, max) {
  if (min > max) {
    throw new Error("Minimum value must be less than or equal to the maximum value.");
  }

  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export const logTransaction = (transaction, name) => {
  const logFilePath = path.join(__dirname, `${name}.json`)
  let transactions = [];

  if (fs.existsSync(logFilePath)) {
    const data = fs.readFileSync(logFilePath, 'utf8');
    transactions = JSON.parse(data);
  }

  transactions.push(transaction);
  fs.writeFileSync(logFilePath, JSON.stringify(transactions, null, 2), 'utf8')
}

export const readTransaction = (name) => {

  const logFilePath = path.join(__dirname, `${name}.json`);
  let transactions = [];
  let transaction;

  if (fs.existsSync(logFilePath)) {
    const data = fs.readFileSync(logFilePath, 'utf8');
    transactions = JSON.parse(data);
    transaction = transactions.shift();
    fs.writeFileSync(logFilePath, JSON.stringify(transactions, null, 2), 'utf8')

    return transaction;
  }

  return []
}