require('dotenv').config();
import WebSocket from 'ws';


class WebSocketClient {
    private ws: WebSocket | null = null;
    private previousPriceUsdc: number | null = null;
    private pingInterval: NodeJS.Timeout | null = null;
    private pongTimeout: NodeJS.Timeout | null = null;
    private readonly pingIntervalTime: number = 30000; // 30 seconds
    private readonly pongTimeoutTime: number = 10000; // 10 seconds
    private reconnectDelay: number = 5000; // 5 seconds

    // Initialize the WebSocket client connection
    public async connect() {
        const chain = 'solana'; // Specify the blockchain network
        const apiKey = process.env.BIRDEYE_API_KEY || '0cde864ee8fa4fe989a5c7eb040335f1'; // Load API key from environment variables

        this.ws = new WebSocket(`wss://public-api.birdeye.so/socket/${chain}?x-api-key=${apiKey}`);

        this.ws.on('open', () => {
            console.log('WebSocket Client Connected');
            this.subscribe();
            this.startHeartbeat();
        });

        this.ws.on('message', (data) => {
            if (!data) return;
            const message = JSON.parse(data.toString());
            console.log("Message" , message)
        });

        this.ws.on('pong', () => {
            this.resetPongTimeout();
        });

        this.ws.on('close', () => {
            console.log('WebSocket Connection Closed');
            this.reconnect();
        });

        this.ws.on('error', (error: Error) => {
            console.error('WebSocket Error:', error);
            this.reconnect();
        });
    }

    private startHeartbeat() {
        if (!this.ws) return;

        this.pingInterval = setInterval(() => {
            if (this.ws && this.ws.readyState === WebSocket.OPEN) {
                console.log('Sending ping');
                this.ws.ping();
                this.startPongTimeout();
            }
        }, this.pingIntervalTime);
    }

    private startPongTimeout() {
        this.pongTimeout = setTimeout(() => {
            console.log('Pong not received, reconnecting...');
            this.reconnect();
        }, this.pongTimeoutTime);
    }

    private resetPongTimeout() {
        if (this.pongTimeout) {
            clearTimeout(this.pongTimeout);
            this.pongTimeout = null;
        }
    }

    private stopHeartbeat() {
        if (this.pingInterval) {
            clearInterval(this.pingInterval);
            this.pingInterval = null;
        }
        this.resetPongTimeout();
    }

    private reconnect() {
        this.stopHeartbeat();
        if (this.ws) {
            this.ws.removeAllListeners();
            this.ws.close();
            this.ws = null;
        }
        console.log(`Reconnecting in ${this.reconnectDelay / 1000} seconds...`);
        setTimeout(() => {
            this.connect();
        }, this.reconnectDelay);
    }

    private handleMessage(message: any) {
        if (Array.isArray(message)) {
            message.forEach((transaction: any) => {
                const currentPriceUsdc = transaction.priceUsdc;

                if (this.previousPriceUsdc !== null) {
                    const priceImpact = ((currentPriceUsdc - this.previousPriceUsdc) / this.previousPriceUsdc) * 100;
                    console.log(`Transaction ID: https://solscan.io/tx/${transaction.transactionId}`);
                    console.log(`Price Impact: ${priceImpact.toFixed(2)}%`);
                    console.log('\n');
                } else {
                    console.log(`Transaction ID: https://solscan.io/tx/${transaction.transactionId}`);
                    console.log(`No previous transaction to compare for price impact.`);
                    console.log('\n');
                }

                this.previousPriceUsdc = currentPriceUsdc;
            });
        }
    }

    private subscribe() {
        if (!this.ws) {
            console.error('WebSocket is not connected.');
            return;
        }

        const msg = {
            type: 'SUBSCRIBE_TXS',
            data: {
                address: 'EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm', // Replace with your token address
            },
        };

        this.ws.send(JSON.stringify(msg));
    }
}

// Initialize and connect the WebSocket client
const socket = new WebSocketClient();
socket.connect();
