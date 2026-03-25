import { Schema, model } from "mongoose"

const airlineSchema = new Schema(
    {
        name: {
            type: String,
            require: true,
            lowercase: true,
        },
        code: {
            lowercase: true,
            required: true,
            type: String,
        },

        //  Airline Logo (image URL or file path)
        logo: {
            type: String,
            required: true,
        },
    },
    { timestamps: true }
)

const Airline = model("Airline", airlineSchema)
export default Airline
