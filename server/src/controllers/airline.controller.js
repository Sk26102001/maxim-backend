import Airline from "../models/airline.model.js"

/**
 * ADD AIRLINE (with logo)
 * expects: name, code in body + logo in req.file
 */
export const addAirline = async (req, res) => {
    try {
        const { name, code } = req.body

        const newAirline = new Airline({
            name,
            code,
            logo: req.file?.path || req.file?.secure_url,
        })

        await newAirline.save()

        return res.status(201).json({ message: "Airline added" })
    } catch (error) {
        return res.status(error.status || 500).json({
            status: error.status || 500,
            message: error.message || "Internal server error",
        })
    }
}

/**
 * UPDATE AIRLINE (name / code / logo)
 */
export const updateAirline = async (req, res) => {
    try {
        const { id } = req.params
        const { name, code } = req.body

        const updateData = {
            name,
            code,
        }

        if (req.file) {
            updateData.logo = req.file.path || req.file.secure_url
        }

        await Airline.findByIdAndUpdate(id, updateData, { new: true })

        return res.status(200).json({ message: "Airline updated" })
    } catch (error) {
        return res.status(error.status || 500).json({
            status: error.status || 500,
            message: error.message || "Internal server error",
        })
    }
}

/**
 * DELETE AIRLINE
 */
export const deleteAirline = async (req, res) => {
    try {
        const { id } = req.params

        await Airline.findByIdAndDelete(id)

        return res.status(200).json({ message: "Airline deleted" })
    } catch (error) {
        return res.status(error.status || 500).json({
            status: error.status || 500,
            message: error.message || "Internal server error",
        })
    }
}

/**
 * GET ALL AIRLINES
 */
export const getAllAirline = async (req, res) => {
    try {
        const airlines = await Airline.find()

        const formattedAirlines = airlines.map((airline) => ({
            ...airline.toObject(),
            logo: airline.logo?.replace(/\\/g, "/"),
        }))

        return res.status(200).json(formattedAirlines)
    } catch (error) {
        return res.status(error.status || 500).json({
            status: error.status || 500,
            message: error.message || "Internal server error",
        })
    }
}

/**
 * GET SINGLE AIRLINE (for Edit Page)
 */
export const getSingleAirline = async (req, res) => {
    try {
        const { id } = req.params

        const airline = await Airline.findById(id)

        if (!airline) {
            return res.status(404).json({
                message: "Airline not found",
            })
        }

        return res.status(200).json({
            ...airline.toObject(),
            logo: airline.logo?.replace(/\\/g, "/"),
        })
    } catch (error) {
        return res.status(error.status || 500).json({
            status: error.status || 500,
            message: error.message || "Internal server error",
        })
    }
}
