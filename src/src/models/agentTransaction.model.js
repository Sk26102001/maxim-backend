import { Schema, model } from "mongoose"

const agentTransactionSchema = new Schema(
    {
        ref: { type: String, required: true },
        agentId: { type: String, required: true },
        date: { type: Date, required: true },
        amount: { type: Number, default: 0, required: true },
        paymentMode: { type: String, required: true },
        remark: { type: String },
        type: { type: String, default: "credit", enum: ["credit", "debit"] },
        balance: { type: Number, default: 0, required: true },

        // NEW optional field for transaction details
        transactionDetails: {
            from: { type: String },
            to: { type: String },
            travelDate: { type: Date },
            seat: { type: String },
            pnr: { type: String },
            passengerName: { type: String }, // include title, e.g., "Mr UJJWAL SHARMA"
        },
    },
    { timestamps: true }
)

const AgentTransaction = model("AgentTransaction", agentTransactionSchema)
export default AgentTransaction
