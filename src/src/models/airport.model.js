import { Schema, model } from "mongoose"

const airportSchema = new Schema(
    {
        airportCode: { type: String, required: true, uppercase: true, unique: true },
        airportName: { type: String, required: true },
        airportCity: { type: String, required: true },
        countryName: { type: String, required: true },
        countryCode: { type: String, required: true },
        noOfAirports: { type: Number, required: true },
        isAirportCity: { type: Boolean, required: true },
    },
    { timestamps: true }
)

const Airport = model("Airport", airportSchema)
export default Airport
