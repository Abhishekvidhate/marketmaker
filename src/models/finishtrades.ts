import mongoose, { Document, Model, Schema } from 'mongoose';

interface IFinishTrade extends Document {
    walletAddress: string;
    initialAmount: number;
    finalAmount: number;
    profitOrLoss: 'Profit' | 'Loss';
    description: string;
}

const finishTradeSchema: Schema<IFinishTrade> = new mongoose.Schema({
    walletAddress: {
        type: String,
        required: true
    },
    initialAmount: {
        type: Number,
        required: true
    },
    finalAmount: {
        type: Number,
        required: true
    },
    profitOrLoss: {
        type: String,
        enum: ['Profit', 'Loss'],
        required: true
    },
    description: {
        type: String,
        enum: ['Profit', 'Loss'],
        required: true
    }
}, {
    timestamps: true  
});

const FinishTrades: Model<IFinishTrade> = mongoose.model<IFinishTrade>('finishtrades', finishTradeSchema);

export default FinishTrades;
