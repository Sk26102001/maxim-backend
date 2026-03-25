import mongoose from "mongoose"
import { passengerSchema2 } from "./inventory.passenger.model.js"

const inventoryDateSchema = new mongoose.Schema({
    travelDate: {
        type: Date,
        required: true,
        index: true,
    },

    groupCode: {
        type: String,
        trim: true,
    },

    pnr: {
        type: String,
        trim: true,
    },

    seats: {
        type: Number,
        min: 0,
    },

    //  ADD PNR STATUS FIELD HERE
    pnrStatus: {
        type: String,
        enum: ["available", "uploaded", "booked"],
        default: "available",
    },

    //  Add passengers array
    passengers: {
        type: [passengerSchema2], // embed passenger schema
        default: [], // always initialized
    },

    // ✅ Airline snapshot fields
    airlineName: { type: String, trim: true },
    airlineCode: { type: String, trim: true },
    airlineNumber: { type: String, trim: true },
    fareClass: { type: String, trim: true },
    fareType: { type: String, trim: true },
    fromCity: { type: String, trim: true },
    fromCode: { type: String, trim: true },
    toCity: { type: String, trim: true },
    toCode: { type: String, trim: true },
    departTime: { type: String, trim: true },
    arriveTime: { type: String, trim: true },
})

const inventorySchema = new mongoose.Schema(
    {
        seriesId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Series2",
            required: true,
            index: true,
        },

        agencyId: {
            type: String,
            index: true,
        },

        fareValidity: {
            type: String,
            trim: true,
        },

        dateFrom: {
            type: Date,
            required: true,
        },

        dateTo: {
            type: Date,
            required: true,
        },

        basePrice: {
            type: Number,
            default: 0,
        },

        tax: {
            type: Number,
            default: 0,
        },

        totalPrice: {
            type: Number,
            required: true,
        },

        infantPrice: {
            type: Number,
            default: 0,
        },

        status: {
            type: String,
            enum: ["backend", "confirmed", "cancelled", "flight-cancelled", "hold", "blocked", "refunded", "irop", "released", "web-tj", "web-tbo", "b2b-web", "web-aiq"],
            default: "hold",
            index: true,
        },

        cancellationCharges: {
            type: String,
            trim: true,
        },

        rescheduleCharges: {
            type: String,
            trim: true,
        },

        inventoryDates: {
            type: [inventoryDateSchema],
            validate: {
                validator: function (v) {
                    return v && v.length > 0
                },
                message: "At least one inventory date is required",
            },
        },

        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
    },
    {
        timestamps: true,
    }
)

// export default mongoose.model("Inventory", inventorySchema)

const Inventory2 = mongoose.model("Inventory2", inventorySchema)
export default Inventory2
