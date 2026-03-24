import { model, Schema } from "mongoose"

const counterSchema = new Schema({
    name: { type: String, required: true, unique: true },
    seq: { type: Number, default: 0 },
})

const AgentCounter = model("AgentCouter", counterSchema)
export default AgentCounter
