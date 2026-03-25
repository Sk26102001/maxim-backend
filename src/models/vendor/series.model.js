import { Schema, model } from "mongoose"

const seriesSchema = new Schema(
    {
        airlineName: String,
        airlineCode: String,
        from: { city: String, code: String },
        to: { city: String, code: String },
        stops: String,
        fareType: String,
        checkinBaggage: String,
        cabinBaggage: String,
        totalDuration: String,
        adminId: String,
        departTime: String,
        departCity: String,
        arriveTime: String,
        arriveCity: String,
        airline: { name: String, code: String },
        airlineNumber: String,
        duration: String,
        fareClass: String,
        depart: String,
        arrive: String,
        departAirportName: String,
        departAirportCode: String,
        arriveAirportName: String,
        arriveAirportCode: String,
        fareId: { type: String, index: true },
        status: { type: String, enum: ["active", "inactive"], default: "active" },
    },
    { timestamps: true }
)

const Series = model("Series2", seriesSchema)
export default Series
