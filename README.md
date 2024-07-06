# Solana Trading Bot

## Overview
This project is a Solana trading bot that automates the process of tracking exclusive token holders, monitoring their SOL balance, and executing buy and sell orders based on certain conditions. The bot performs the following tasks:

1. Picks a specific token.
2. Finds holders who have only that token as their balance.
3. Continuously refreshes the holders list (adding new holders and removing those who no longer meet the criteria).
4. Tracks each holder to detect if they add SOL to their wallet.
5. Buys the specified token if SOL is added to a holder's wallet and then sells the token after they buy the token.
6. Sells the token after a certain period if the holder doesn't buy the token after adding SOL to their wallet.

## Project Structure

- **index.ts**: The main file that orchestrates the bot's operations.
- **monitor.ts**: Contains the logic for monitoring SOL balance and token purchased or not.
- **RaydiumSwap.ts**: RaydiumSwap.ts defines the RaydiumSwap class that encapsulates the functionality for performing token swaps using Raydium on the Solana blockchain.
- **swap.ts**: swap.ts combines the functionality implemented in RaydiumSwap.ts and the configuration specified in swapConfig.ts to perform or simulate a token swap. 
- **swapConfig.ts** : The swapConfig.ts file holds the configuration settings for a token swap using the Raydium SDK on the Solana blockchain. This is where you set the parameters used throughout the swap process.
- **types.ts**: Defines the TypeScript types used throughout the project.
- **utils.ts**: Utility functions used in various parts of the project.

## Prerequisites

Before setting up the project, ensure you have the following installed:

- [Node.js](https://nodejs.org/en/download/) (v14 or higher)
- [npm](https://www.npmjs.com/get-npm)
- [yarn](https://yarnpkg.com/)

## Setup Instructions

1. **Clone the Repository:**

    ```sh
    git clone https://github.com/mukul013/solana-bot.git
    cd solana-trading-bot
    ```

2. **Install Dependencies:**

    ```sh
    yarn
    ```
    OR
    ```sh
    npm i
    ```
    
3. **Configure Environment Variables:**

    Create a `.env` file in the root directory of the project and add your Helius API credentials (https://www.helius.dev/):

    ```env
    HELIUS_API_KEY = your_helius_api_key
    ```
    ```env
    RPC_URL = your_rpc_url
    ```
    ```env
    WALLET_PRIVATE_KEY= your_private_key
    ```
    ```env
    SOL_ADDRESS = sol_mint_address || So11111111111111111111111111111111111111112
    ```

4. **Run the Project:**

    ```sh
    yarn start
    ```
    OR
    ```sh
    npm start
    ```

Once the bot is running, it will automatically:

1. Pick the specified token.
2. Find holders who have only that token as their balance.
3. Continuously refresh the holders list.
4. Track each holder's SOL balance.
5. Execute buy and sell orders based on the detected changes in SOL balance. 

## Contributing

Contributions are welcome! If you have any suggestions or improvements, feel free to open an issue or submit a pull request.
