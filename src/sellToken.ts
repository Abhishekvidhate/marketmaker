import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import { Wallet } from "@project-serum/anchor";
import bs58 from "bs58";
import { getBalanceOfToken, getTokenDecimals } from "./utils/utils";
import "dotenv/config";
import {
  convertToInteger,
  finalizeTransaction,
  getQuote,
  getSwapTransaction,
} from "./swapperHelper";
import { SOLANA_ADDRESS } from "./config/consts";

export const sellToken = async (
  primaryWallet: Keypair,
  sellAll: boolean,
  addressOfTokenOut: string,
  waitForConfirmation: boolean,
  amountOfTokenToSell?: number
): Promise<string> => {
  if (!sellAll && !amountOfTokenToSell) {
    throw new Error(
      "You need to specify AMOUNT_OF_TOKEN_TO_SELL if SELL_ALL is false"
    );
  }

  const connection = new Connection(process.env.RPC_URL);
  const wallet = new Wallet(primaryWallet);

  const publicKeyOfWalletToQuery = wallet.publicKey.toString();
  sellAll
    ? (amountOfTokenToSell = await getBalanceOfToken(
        publicKeyOfWalletToQuery,
        addressOfTokenOut
      ))
    : amountOfTokenToSell;

  if (!amountOfTokenToSell) {
    throw new Error("No tokens to sell");
  }

  console.log(`Selling ${amountOfTokenToSell}`);

  try {
    const decimals = await getTokenDecimals(addressOfTokenOut);
    const slippage = 100; // slippage is 1%
    const convertedAmountOfTokenOut = convertToInteger(
      amountOfTokenToSell,
      decimals
    );

    const quoteResponse = await getQuote(
      addressOfTokenOut,
      SOLANA_ADDRESS,
      convertedAmountOfTokenOut,
      slippage
    );

    const walletPublicKey = wallet.publicKey.toString();

    const swapTransaction = await getSwapTransaction(
      quoteResponse,
      walletPublicKey
    );

    const txid = await finalizeTransaction(swapTransaction, wallet, connection);

    const latestBlockhash = await connection.getLatestBlockhash()

    console.log("Waiting for confirmation... 🕒");
   
    if(waitForConfirmation){
      const confirmation = await connection.confirmTransaction(
        {
          signature: txid,
          blockhash: latestBlockhash.blockhash,
          lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
        },
        'finalized' // Optional commitment level
      );
  
      if (confirmation.value.err) {
        throw new Error("Confrimtaion error")
      }
    }

    // if (waitForConfirmation) {
    //   //wait
    //   let subscriptionId;
    //   try {
    //     subscriptionId = connection.onSignature(
    //       txid,
    //       (updatedTxInfo, context) => {
    //         if (updatedTxInfo.err) {
    //           console.error("Transaction failed:", updatedTxInfo.err);
    //         }
    //       },
    //       "finalized"
    //     );
    //   } finally {
    //     if (subscriptionId) {
    //       connection.removeSignatureListener(subscriptionId);
    //     }
    //   }
    // } 

    console.log(`Sell = https://solscan.io/tx/${txid}`);
    return txid;
  } catch (error: any) {
    throw new Error(error);
  }
};