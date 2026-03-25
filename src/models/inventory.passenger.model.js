// inventory.passenger.schema.js
import mongoose from "mongoose"

export const passengerSchema = new mongoose.Schema(
    {
        // 🔗 Reference to Inventory (SAFE, OPTIONAL)
        inventoryId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Inventory",
            index: true,
        },

        // 🔗 Reference to Agent
        agentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Agent",
            index: true,
        },

        // ✅ BOOKING ID (DERIVED FROM _id)
        bookingId: {
            type: String,
            index: true,
        },

        type: {
            type: String,
            enum: ["adult", "child"],
            default: "adult",
        },

        title: {
            type: String,
            enum: ["Mr", "Mrs", "Miss", "Ms"],
            default: "Mr",
        },

        firstName: {
            type: String,
            trim: true,
            // required: true,
        },

        lastName: {
            type: String,
            trim: true,
        },

        price: {
            type: Number,
            required: true,
        },

        seat: {
            type: String,
            trim: true,
        },

        status: {
            type: String,
            enum: ["backend", "confirmed", "hold", "irop", "cancelled", "refunded", "released", "ts", "tj", "tbo", "f2f", "other"],
            default: "backend",
        },

        emailStatus: {
            type: String,
            enum: ["pending", "sent"],
            default: "pending",
        },

        depositDone: {
            type: Boolean,
            default: false,
        },

        revenueDone: {
            type: Boolean,
            default: false,
        },

        infant: {
            title: {
                type: String,
                enum: ["Mr","Mstr", "Mrs", "Miss", "Ms"],
                default: "Mr",
            },
            firstName: {
                type: String,
                trim: true,
                // required: true,
            },
            lastName: {
                type: String,
                trim: true,
            },
            dob: {
                type: Date,
                // required: true,
            },
            price: {
                type: Number,
                default: 1750,
            },
        },

        refId: {
            type: String,
            trim: true,
            required: true,
        },
    },
    { timestamps: true }
)
