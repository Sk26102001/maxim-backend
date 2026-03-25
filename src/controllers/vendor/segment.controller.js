import Counter from "../../models/counter.model.js"
import Segment from "../../models/vendor/segment.model.js"

async function getNextFareId() {
    const counter = await Counter.findOneAndUpdate({ name: "fareId" }, { $inc: { seq: 1 } }, { new: true, upsert: true })

    const paddedNumber = String(counter.seq).padStart(3, "0")
    return `AMT${paddedNumber}`
}
export const addSegment = async (req, res) => {
    try {
        const { body } = req
        const { departFromDate, departToDate } = body

        const start = new Date(departFromDate)
        const end = new Date(departToDate)

        if (isNaN(start) || isNaN(end) || start > end) {
            return res.status(400).json({ message: "Invalid date range" })
        }

        const segmentsToInsert = []
        let currentDate = new Date(start)

        while (currentDate <= end) {
            const fareId = await getNextFareId()

            segmentsToInsert.push({
                ...body,
                fareId,
                departFromDate: new Date(currentDate),
                departToDate: new Date(currentDate),
            })

            currentDate.setDate(currentDate.getDate() + 1)
        }

        await Segment.insertMany(segmentsToInsert)

        return res.status(201).json({ message: `${segmentsToInsert.length} segments added` })
    } catch (error) {
        return res.status(error.status || 500).json({
            status: error.status || 500,
            message: error.message || "Internal server error",
        })
    }
}

export const getAllSegment = async (req, res) => {
    try {
        const { page = 1, limit = 20 } = req.query
        const skip = (page - 1) * limit

        const totalDocs = await Segment.countDocuments({})
        const totalPage = Math.ceil(totalDocs / limit)
        const segments = await Segment.find({}).populate("airline").select("-matchingFlights -allFlights").skip(skip).limit(limit)
        return res.status(200).json({ segments, totalPage })
    } catch (error) {
        return res.status(error.status || 500).json({
            status: error.status || 500,
            message: error.message || "Internal server error",
        })
    }
}
export const deleteSegment = async (req, res) => {
    try {
        const { id } = req.params
        await Segment.findByIdAndDelete(id)
        return res.status(200).json({ message: "Segment deleted" })
    } catch (error) {
        return res.status(error.status || 500).json({
            status: error.status || 500,
            message: error.message || "Internal server error",
        })
    }
}

export const deleteManySegments = async (req, res) => {
    try {
        const { ids } = req.body

        if (!Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({ message: "No IDs provided" })
        }

        await Segment.deleteMany({ _id: { $in: ids } })
        return res.status(200).json({ message: "Segments deleted" })
    } catch (error) {
        return res.status(error.status || 500).json({
            status: error.status || 500,
            message: error.message || "Internal server error",
        })
    }
}

export const updateSegment = async (req, res) => {
    try {
        const { id } = req.params
        if (!id) return res.status(400).json({ message: "No ID provided" })
        const segment = await Segment.findById(id)
        if (!segment) return res.status(404).json({ message: "Invalid ID" })
        const updatedSegment = await Segment.findByIdAndUpdate(id, req.body, {
            new: true,
        })
        return res.status(200).json(updatedSegment)
    } catch (error) {
        return res.status(error.status || 500).json({
            status: error.status || 500,
            message: error.message || "Internal server error",
        })
    }
}
export const getSegmentById = async (req, res) => {
    try {
        const { id } = req.params
        if (!id) return res.status(400).json({ message: "No ID provided" })
        const segment = await Segment.findById(id).populate("airline")
        if (!segment) return res.status(404).json({ message: "Invalid ID" })
        return res.status(200).json(segment)
    } catch (error) {
        return res.status(error.status || 500).json({
            status: error.status || 500,
            message: error.message || "Internal server error",
        })
    }
}
