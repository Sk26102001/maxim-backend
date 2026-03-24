import { Schema, model } from "mongoose"

const generatorSchema = new Schema({
    name: { type: String, required: true, unique: true },
    seq: { type: Number, default: 0 },
})

const Generator = model("Generator", generatorSchema)
export default Generator
