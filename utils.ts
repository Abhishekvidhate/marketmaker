import { GetTokenAccountsParams } from "./types";
import fs from "fs";
import path from "path"
require("dotenv").config();
const apiKey = process.env.HELIUS_API_KEY;


export async function getTokenAccounts(tokenMintAddress:string) {
  let allOwners = new Set();
  let cursor;

  const url = `https://mainnet.helius-rpc.com/?api-key=${apiKey}`;

  while (true) {
    let params: GetTokenAccountsParams = {
      limit: 1000,
      mint: tokenMintAddress,
    };

    if (cursor != undefined) {
      params.cursor = cursor;
    }

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "getTokenAccounts",
        params: params,
      }),
    });

    const data = await response.json();

    if (!data.result || data.result.token_accounts.length === 0) {
      console.log("Token holders saved to the file.");
      break;
    }

    data.result.token_accounts.forEach((account) => {
      allOwners.add(account.owner);
    });

    cursor = data.result.cursor;
  }

  fs.writeFileSync(
    "tokenHolders.json",
    JSON.stringify(Array.from(allOwners), null, 2)
  );
};

export async function getExclusiveTokenHolders(tokenMintAddress: string) {
    const url = `https://mainnet.helius-rpc.com/?api-key=${apiKey}`;
    await getTokenAccounts(tokenMintAddress);
    try {
      const allOwnersData = JSON.parse(fs.readFileSync("tokenHolders.json", "utf8"));
      const allOwnersDataSliced = allOwnersData.slice(0, 999); //sliced data because of API Limitation in free account
  
      const exclusiveHolders: string[] = [];
      const now = new Date().getTime();
  
      await Promise.all(
        allOwnersDataSliced.map(async (holder) => {
          const ownerResponse = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              jsonrpc: "2.0",
              method: "getTokenAccountsByOwner",
              id: 1,
              params: [
                holder,
                {
                  programId: "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
                },
                {
                  encoding: "jsonParsed",
                },
              ],
            }),
          });
  
          const ownerData = await ownerResponse.json();
  
          if (ownerData.result) {
            const ownerTokenAccounts = ownerData.result.value;
  
            if (
              ownerTokenAccounts.length === 1 &&
              ownerTokenAccounts[0].account.data.parsed.info.mint ===
                tokenMintAddress
            ) {
              exclusiveHolders.push(holder);
            }
          }
        })
      );
      console.log("Time Taken in sec", (new Date().getTime() - now) / 1000);
      fs.writeFileSync(
        "exclusiveHolders.json",
        JSON.stringify(exclusiveHolders, null, 2)
      );
      console.log("Exclusive token holders saved to file.");
    } catch (error) {
      console.error("Error reading owner data from file:", error);
    }
}

export async function getSolanaBalance(walletAddress: string): Promise<number> {
  const url = `https://mainnet.helius-rpc.com/?api-key=${apiKey}`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        method: "getBalance",
        id: 1,
        params: [walletAddress],
      }),
    });

    const data = await response.json();
    if (data.result) {
      return data.result.value;
    } else {
      console.error("Error fetching balance:", data.error);
    }
  } catch (error) {
    console.error("Error fetching balance:", error);
  }
  return 0;
}

export async function getTokenBalance(walletAddress: string): Promise<number> {
  const url = `https://mainnet.helius-rpc.com/?api-key=${apiKey}`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        method: "getTokenAccountsByOwner",
        id: 1,
        params: [
          walletAddress,
          {
            programId: "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
          },
          {
            encoding: "jsonParsed",
          },
        ],
      }),
    });

    const data = await response.json();
    if (data.result) {
      return data.result.value[0].account.data.parsed.info.tokenAmount.uiAmount;
    } else {
      console.error("Error fetching balance:", data.error);
    }
  } catch (error) {
    console.error("Error fetching balance:", error);
  }
  return 0;
}

export function readExclusiveTokenHolders(): string[] {
    const filePath = path.join(__dirname, 'exclusiveHolders.json');
    if (fs.existsSync(filePath)) {
        const data = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(data);
    }
    return [];
}


