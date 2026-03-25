import Generator from "../models/generator.model.js"

export async function IDGenerator(fieldName, startsWith) {
    const counter = await Generator.findOneAndUpdate({ name: fieldName }, { $inc: { seq: 1 } }, { new: true, upsert: true })

    const paddedNumber = String(counter.seq).padStart(3, "0")
    console.log(`${startsWith}${paddedNumber}`)
    return `${startsWith}${paddedNumber}`
}
