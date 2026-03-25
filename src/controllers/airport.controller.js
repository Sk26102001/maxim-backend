import Airport from "../models/airport.model.js"

export const addAirport = async (req, res) => {
    try {
        const { body } = req

        const newAirport = new Airport(body)
        await newAirport.save()

        return res.status(201).json({ message: "Airport added successfully" })
    } catch (err) {
        // ✅ Duplicate key error (unique constraint)
        if (err.code === 11000) {
            return res.status(409).json({
                message: "Sector is already added",
            })
        }

        return res.status(500).json({
            message: err.message || "Internal server error",
        })
    }
}

// export const addAirport = async (req, res) => {
//     try {
//         const { body } = req
//         const newAirport = new Airport(body)
//         await newAirport.save()
//         return res.status(201).json({ message: "Airport added" })
//     } catch (err) {
//         return res.status(err.status || 500).json({ message: err.message || "Internal server error" })
//     }
// }
export const getAllAirport = async (req, res) => {
    try {
        const { q, page = 1, limit = 20 } = req.query
        const skip = (page - 1) * limit

        let filter = {}
        if (q) {
            filter = {
                $or: [
                    { airportCode: { $regex: q, $options: "i" } },
                    { airportName: { $regex: q, $options: "i" } },
                    { airportCity: { $regex: q, $options: "i" } },
                    { countryName: { $regex: q, $options: "i" } },
                    { countryName: { $regex: q, $options: "i" } },
                    { countryCode: { $regex: q, $options: "i" } },
                ],
            }
        }
        const totalDocs = await Airport.countDocuments(filter)
        const totalPage = Math.ceil(totalDocs / limit)
        const airports = await Airport.find(filter).skip(skip).limit(limit)
        return res.status(200).json({ airports, totalPage })
    } catch (err) {
        return res.status(err.status || 500).json({ message: err.message || "Internal server error" })
    }
}

export const editAirport = async (req, res) => {
    try {
        const { id } = req.params
        const { body } = req
        await Airport.findByIdAndUpdate(id, body)
        return res.status(200).json({ message: "Airport updated" })
    } catch (err) {
        return res.status(err.status || 500).json({ message: err.message || "Internal server error" })
    }
}

export const deleteAirport = async (req, res) => {
    try {
        const { id } = req.params
        await Airport.findByIdAndDelete(id)
        return res.status(200).json({ message: "Airport deleted" })
    } catch (err) {
        return res.status(err.status || 500).json({ message: err.message || "Internal server error" })
    }
}

export const getAirportById = async (req, res) => {
    try {
        const { id } = req.params
        const airport = await Airport.findById(id)
        return res.status(200).json(airport)
    } catch (err) {
        return res.status(err.status || 500).json({ message: err.message || "Internal server error" })
    }
}
