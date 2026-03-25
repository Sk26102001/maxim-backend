import mongoose from "mongoose"

const lowestFlightSchema = new mongoose.Schema(
    {
        sector: String,
        travelDate: String,
        airline: String,
        flightCode: String,
        departure: Date,
        arrival: Date,
        duration: String,
        fare: Number,
    },
    { _id: false }
)

const segmentSchema = new mongoose.Schema(
    {
        fareId: { type: String, required: true },
        fromAirport: { type: String, required: true },
        toAirport: { type: String, required: true },
        departFromDate: { type: Date, required: true },

        adult: { type: Number, default: 1 },
        child: { type: Number, default: 0 },
        infant: { type: Number, default: 0 },

        airline: [{ type: mongoose.Schema.Types.ObjectId, ref: "Airline" }],

        alertPrice: { type: Number, required: true },
        currentPrice: { type: Number },

        lowestFlight: lowestFlightSchema,

        apiCount: { type: Number, default: 0 },
        status: {
            type: String,
            enum: ["no-flights", "checked", "alert", "pending"],
            default: "pending",
        },
    },
    { timestamps: true }
)

// export default mongoose.model("Segment", segmentSchema)

const Segment = mongoose.model("Segment2", segmentSchema)
export default Segment
