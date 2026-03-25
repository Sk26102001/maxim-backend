import { Schema, model } from 'mongoose'

const UserCounterSchema = new Schema({
    name: { type: String, required: true, unique: true },
    seq: { type: Number, default: 0 },
})

const UserCounter = model('UserCounter', UserCounterSchema)
export default UserCounter
