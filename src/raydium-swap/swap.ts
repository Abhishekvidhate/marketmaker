import RaydiumSwap from './RaydiumSwap';
import { Transaction, VersionedTransaction } from '@solana/web3.js';
import 'dotenv/config';
import { swapConfig } from './swapConfig'; // Import the configuration
import path from 'path';
import fs from 'fs'
import { jsonInfo2PoolKeys, LiquidityPoolKeys } from '@raydium-io/raydium-sdk';

const rpcUrl = process.env.RPC_URL || 'YOUR_RPC_URL';
const walletPrivateKey = process.env.WALLET_PRIVATE_KEY || 'YOUR_WALLET_PRIVATE_KEY';
/**
 * Performs a token swap on the Raydium protocol.
 * Depending on the configuration, it can execute the swap or simulate it.
 */
export const swap = async (tokenAAmount: number, tokenAAddress: string, tokenBAddress: string) => {
  /**
   * The RaydiumSwap instance for handling swaps.
   */
  const raydiumSwap = new RaydiumSwap(rpcUrl, walletPrivateKey);
  console.log(`Raydium swap initialized`);
  console.log(`Swapping ${tokenAAmount} of ${tokenAAddress} for ${tokenBAddress}...`)


  const filePath = path.join(__dirname, "..", "./files/poolData.json");
  let poolData;
  let poolInfo;

  if (fs.existsSync(filePath)) {
    const data = fs.readFileSync(filePath, "utf-8");
    poolData = JSON.parse(data);
    poolInfo = jsonInfo2PoolKeys(poolData) as LiquidityPoolKeys;
  } else {
    /**
   * Load pool keys from the Raydium API to enable finding pool information.
   */
    await raydiumSwap.loadPoolKeys(swapConfig.liquidityFile);
    console.log(`Loaded pool keys`);

    /**
     * Find pool information for the given token pair.
     */
    poolInfo = raydiumSwap.findPoolInfoForTokens(tokenAAddress, tokenBAddress);
    if (!poolInfo) {
      console.error('Pool info not found');
    } else {
      console.log('Found pool info');
    }
  }


  /**
   * Prepare the swap transaction with the given parameters.
   */
  const tx = await raydiumSwap.getSwapTransaction(
    tokenBAddress,
    tokenAAmount,
    poolInfo,
    swapConfig.maxLamports,
    swapConfig.useVersionedTransaction,
    swapConfig.direction,
  );

  // const { amountOut, minAmountOut, currentPrice, executionPrice, priceImpact, fee } = await raydiumSwap.calcAmountOut(poolInfo, tokenAAmount, true);
  /**
   * Depending on the configuration, execute or simulate the swap.
   */
  if (swapConfig.executeSwap) {
    /**
     * Send the transaction to the network and log the transaction ID.
     * 
     */
    const txid = swapConfig.useVersionedTransaction
      ? await raydiumSwap.sendVersionedTransaction(tx as VersionedTransaction, swapConfig.maxRetries)
      : await raydiumSwap.sendLegacyTransaction(tx as Transaction, swapConfig.maxRetries);

    console.log(`https://solscan.io/tx/${txid}`);
  } else {
    /**
     * Simulate the transaction and log the result.
     */
    const simRes = swapConfig.useVersionedTransaction
      ? await raydiumSwap.simulateVersionedTransaction(tx as VersionedTransaction)
      : await raydiumSwap.simulateLegacyTransaction(tx as Transaction);

    console.log(simRes);
  }
};