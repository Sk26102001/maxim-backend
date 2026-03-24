import Inventory from "../models/inventory.model.js"
import Series from "../models/series.model.js"
import { IDGenerator } from "../services/IDGenerator.js"

export const addSeries = async (req, res) => {
    const { body } = req
    const fareId = await IDGenerator("fareId", "AMT")
    await Series.create({ ...body, fareId })
    return res.status(201).json({ message: "Series added" })
}
export const getAllSeries = async (req, res) => {
    const series = await Series.find()
    return res.status(200).json({ series })
}

export const getSeriesById = async (req, res) => {
    const series = await Series.findById({ _id: req.params.id }).select(
        "fareId airline airlineName airlineCode airlineNumber from to arriveTime departTime totalDuration adminId depart arrive fareClass"
    )
    return res.status(200).json(series)
}

export const editSeries = async (req, res) => {
    try {
        const { id } = req.params
        const { body } = req

        // Check if the series exists
        const series = await Series.findById(id)
        if (!series) {
            return res.status(404).json({
                status: "fail",
                message: "Series not found",
            })
        }

        // Update only the fields sent in the body
        Object.keys(body).forEach((key) => {
            series[key] = body[key]
        })

        // Save the updated series
        await series.save()

        return res.status(200).json({
            status: "success",
            message: "Series updated successfully",
            data: series,
        })
    } catch (error) {
        console.error(error)
        return res.status(500).json({
            status: "error",
            message: "Internal Server Error",
        })
    }
}

// export const addInventory = async (req, res) => {
//     try {
//         const {
//             seriesId,
//             agencyId,
//             fareValidity,
//             dateFrom,
//             dateTo,
//             basePrice = 0,
//             tax = 0,
//             totalPrice,
//             infantPrice = 0,
//             status,
//             cancellationCharges,
//             rescheduleCharges,
//             inventoryDates,
//         } = req.body

//         if (!inventoryDates || !inventoryDates.length) {
//             return res.status(400).json({ status: "fail", message: "Inventory dates required" })
//         }

//         const series = await Series.findById(seriesId)
//         if (!series) {
//             return res.status(404).json({ status: "fail", message: "Series not found" })
//         }

//         const sanitizedInventoryDates = inventoryDates.map((item) => ({
//             travelDate: new Date(item.travelDate),
//             groupCode: item.groupCode || "",
//             pnr: item.pnr || "",
//             seats: Number(item.seats) || 0,
//             passengers: item.passengers || [],
//             pnrStatus: item.pnrStatus || "available",

//             // ✅ AIRLINE SNAPSHOT
//             airlineName: series.airlineName,
//             airlineCode: series.airlineCode,
//             airlineNumber: series.airlineNumber,
//             fareClass: series.fareClass,
//             fareType: series.fareType,
//             fromCity: series.from?.city,
//             fromCode: series.from?.code,
//             toCity: series.to?.city,
//             toCode: series.to?.code,
//             departTime: series.departTime,
//             arriveTime: series.arriveTime,
//         }))

//         const inventory = await Inventory.create({
//             seriesId,
//             agencyId,
//             fareValidity,
//             dateFrom: new Date(dateFrom),
//             dateTo: new Date(dateTo),
//             basePrice,
//             tax,
//             totalPrice,
//             infantPrice,
//             status,
//             cancellationCharges,
//             rescheduleCharges,
//             inventoryDates: sanitizedInventoryDates,
//         })

//         return res.status(201).json({
//             status: "success",
//             message: "Inventory added successfully",
//             data: inventory,
//         })
//     } catch (error) {
//         console.error(error)
//         return res.status(500).json({ status: "error", message: "Server error" })
//     }
// }
export const addInventory = async (req, res) => {
    try {
        const {
            seriesId,
            agencyId,
            fareValidity,
            dateFrom,
            dateTo,
            basePrice = 0,
            tax = 0,
            totalPrice,
            infantPrice = 0,
            status,
            cancellationCharges,
            rescheduleCharges,
            inventoryDates,
        } = req.body

        if (!inventoryDates || !inventoryDates.length) {
            return res.status(400).json({ status: "fail", message: "Inventory dates required" })
        }

        const series = await Series.findById(seriesId)
        if (!series) {
            return res.status(404).json({ status: "fail", message: "Series not found" })
        }

        const sanitizedInventoryDates = inventoryDates.map((item) => ({
            travelDate: new Date(item.travelDate),
            groupCode: item.groupCode || "",
            pnr: item.pnr || "",
            seats: Number(item.seats) || 0,
            passengers: item.passengers || [],
            pnrStatus: item.pnrStatus || "available",

            airlineName: series.airlineName,
            airlineCode: series.airlineCode,
            airlineNumber: series.airlineNumber,
            fareClass: series.fareClass,
            fareType: series.fareType,
            fromCity: series.from?.city,
            fromCode: series.from?.code,
            toCity: series.to?.city,
            toCode: series.to?.code,
            departTime: series.departTime,
            arriveTime: series.arriveTime,
        }))

        const inventory = await Inventory.create({
            seriesId,
            agencyId,
            fareValidity,
            dateFrom: new Date(dateFrom),
            dateTo: new Date(dateTo),
            basePrice,
            tax,
            totalPrice,
            infantPrice,
            status,
            cancellationCharges,
            rescheduleCharges,
            inventoryDates: sanitizedInventoryDates,
        })

        // 🔥 GENERATE BOOKING ID FOR ALL PASSENGERS
        let updated = false

        for (const invDate of inventory.inventoryDates) {
            for (const passenger of invDate.passengers) {
                if (!passenger.bookingId) {
                    passenger.bookingId = `AMT-${passenger._id}`
                    updated = true
                }
            }
        }

        if (updated) {
            await inventory.save()
        }

        return res.status(201).json({
            status: "success",
            message: "Inventory added successfully",
            data: inventory,
        })

    } catch (error) {
        console.error(error)
        return res.status(500).json({ status: "error", message: "Server error" })
    }
}

export const getInventoryDateList = async (req, res) => {
    try {
        const inventoryDates = await Inventory.aggregate([
            // 1️⃣ Unwind inventoryDates
            { $unwind: "$inventoryDates" },

            // 2️⃣ Lookup series
            {
                $lookup: {
                    from: "series",
                    localField: "seriesId",
                    foreignField: "_id",
                    as: "series",
                },
            },
            { $unwind: { path: "$series", preserveNullAndEmptyArrays: true } },

            // 3️⃣ Project required fields including embedded passengers
            {
                $project: {
                    _id: 0,
                    inventoryId: "$_id",
                    inventoryDateId: "$inventoryDates._id", // ✅ added this

                    seriesId: "$series._id",

                    airlineName: "$series.airlineName",
                    airlineCode: "$series.airlineCode",
                    airlineNumber: "$series.airlineNumber",
                    fromCity: "$series.from.city",
                    fromCode: "$series.from.code",
                    toCity: "$series.to.city",
                    toCode: "$series.to.code",
                    departTime: "$series.departTime",
                    arriveTime: "$series.arriveTime",
                    fareClass: "$series.fareClass",
                    fareType: "$series.fareType",

                    agencyId: 1,
                    fareValidity: 1,
                    dateFrom: 1,
                    dateTo: 1,
                    status: 1,
                    basePrice: 1,
                    tax: 1,
                    totalPrice: 1,
                    infantPrice: 1,
                    cancellationCharges: 1,
                    rescheduleCharges: 1,

                    travelDate: "$inventoryDates.travelDate",
                    groupCode: "$inventoryDates.groupCode",
                    pnr: "$inventoryDates.pnr",
                    seats: "$inventoryDates.seats",

                    passengers: "$inventoryDates.passengers",
                },
            },

            // 4️⃣ Sort by travelDate
            { $sort: { travelDate: 1 } },
        ])

        res.status(200).json({
            status: "success",
            count: inventoryDates.length,
            data: inventoryDates,
        })
    } catch (error) {
        console.error(error)
        res.status(500).json({
            status: "error",
            message: "Server error",
        })
    }
}

export const getInventoryDates = async (req, res) => {
    try {
        const { id } = req.params
        const inventory = await Inventory.findOne({ seriesId: id }).populate("seriesId")

        if (!inventory) {
            return res.status(404).json({
                status: "fail",
                message: "Inventory not found",
            })
        }

        return res.status(200).json({
            status: "success",
            data: inventory,
        })
    } catch (error) {
        console.error(error)
        res.status(500).json({
            status: "error",
            message: "Server error",
        })
    }
}

export const deleteSeries = async (req, res) => {
    try {
        const { id } = req.params

        // Check if series exists
        const series = await Series.findById(id)
        if (!series) {
            return res.status(404).json({
                status: "fail",
                message: "Series not found",
            })
        }

        // Delete series
        await Series.findByIdAndDelete(id)

        // Optionally, delete related inventory if needed
        await Inventory.deleteMany({ seriesId: id })

        return res.status(200).json({
            status: "success",
            message: "Series deleted successfully",
        })
    } catch (error) {
        console.error(error)
        return res.status(500).json({
            status: "error",
            message: "Internal Server Error",
        })
    }
}

export const editInventory = async (req, res) => {
    try {
        const { id } = req.params
        const { body } = req

        const inventory = await Inventory.findById(id)
        if (!inventory) {
            return res.status(404).json({ status: "fail", message: "Inventory not found" })
        }

        Object.keys(body).forEach((key) => {
            if (key !== "inventoryDates") {
                inventory[key] = body[key]
            }
        })

        if (Array.isArray(body.inventoryDates)) {
            inventory.inventoryDates = body.inventoryDates.map((item) => ({
                ...item,
                travelDate: new Date(item.travelDate),
                seats: Number(item.seats),
            }))
        }

        await inventory.save()

        return res.status(200).json({
            status: "success",
            message: "Inventory updated successfully",
            data: inventory,
        })
    } catch (error) {
        return res.status(500).json({ status: "error", message: "Server error" })
    }
}

export const getInventoryById = async (req, res) => {
    try {
        const inventory = await Inventory.findById(req.params.id).populate("seriesId")

        if (!inventory) {
            return res.status(404).json({
                status: "fail",
                message: "Inventory not found",
            })
        }

        res.status(200).json({
            status: "success",
            data: inventory,
        })
    } catch (error) {
        console.error(error)
        res.status(500).json({
            status: "error",
            message: "Server error",
        })
    }
}

export const getAllInventories = async (req, res) => {
    try {
        const inventories = await Inventory.find().populate("seriesId").sort({ createdAt: -1 })

        return res.status(200).json({
            status: "success",
            count: inventories.length,
            data: inventories,
        })
    } catch (error) {
        console.error(error)
        return res.status(500).json({
            status: "error",
            message: "Server error",
        })
    }
}

export const getUpcomingInventoryDates = async (req, res) => {
    try {
        const today = new Date()
        today.setHours(0, 0, 0, 0)

        const data = await Inventory.aggregate([
            { $unwind: "$inventoryDates" },

            {
                $match: {
                    "inventoryDates.travelDate": { $gte: today },
                },
            },

            {
                $lookup: {
                    from: "series",
                    localField: "seriesId",
                    foreignField: "_id",
                    as: "series",
                },
            },
            { $unwind: { path: "$series", preserveNullAndEmptyArrays: true } },

            {
                $addFields: {
                    "inventoryDates.airlineName": {
                        $ifNull: ["$inventoryDates.airlineName", "$series.airlineName"],
                    },
                    "inventoryDates.airlineCode": {
                        $ifNull: ["$inventoryDates.airlineCode", "$series.airlineCode"],
                    },
                    "inventoryDates.airlineNumber": {
                        $ifNull: ["$inventoryDates.airlineNumber", "$series.airlineNumber"],
                    },
                    "inventoryDates.fareClass": {
                        $ifNull: ["$inventoryDates.fareClass", "$series.fareClass"],
                    },
                    "inventoryDates.fareType": {
                        $ifNull: ["$inventoryDates.fareType", "$series.fareType"],
                    },
                    "inventoryDates.fromCity": {
                        $ifNull: ["$inventoryDates.fromCity", "$series.from.city"],
                    },
                    "inventoryDates.fromCode": {
                        $ifNull: ["$inventoryDates.fromCode", "$series.from.code"],
                    },
                    "inventoryDates.toCity": {
                        $ifNull: ["$inventoryDates.toCity", "$series.to.city"],
                    },
                    "inventoryDates.toCode": {
                        $ifNull: ["$inventoryDates.toCode", "$series.to.code"],
                    },
                    "inventoryDates.departTime": {
                        $ifNull: ["$inventoryDates.departTime", "$series.departTime"],
                    },
                    "inventoryDates.arriveTime": {
                        $ifNull: ["$inventoryDates.arriveTime", "$series.arriveTime"],
                    },
                },
            },

            {
                $project: {
                    _id: 0,
                    inventoryId: "$_id",
                    inventoryDateId: "$inventoryDates._id",

                    // ✅ SERIES REFERENCE AND STATUS
                    seriesId: "$series._id",
                    fareId: "$series.fareId",
                    seriesStatus: "$series.status", // Add this line

                    // ✅ Use enhanced inventoryDates fields (with fallback to series)
                    airlineName: "$inventoryDates.airlineName",
                    airlineCode: "$inventoryDates.airlineCode",
                    airlineNumber: "$inventoryDates.airlineNumber",
                    fareClass: "$inventoryDates.fareClass",
                    fareType: "$inventoryDates.fareType",
                    fromCity: "$inventoryDates.fromCity",
                    fromCode: "$inventoryDates.fromCode",
                    toCity: "$inventoryDates.toCity",
                    toCode: "$inventoryDates.toCode",
                    departTime: "$inventoryDates.departTime",
                    arriveTime: "$inventoryDates.arriveTime",

                    // ✅ INVENTORY DATE FIELDS
                    travelDate: "$inventoryDates.travelDate",
                    groupCode: "$inventoryDates.groupCode",
                    pnr: "$inventoryDates.pnr",
                    seats: "$inventoryDates.seats",
                    pnrStatus: "$inventoryDates.pnrStatus",
                    passengers: "$inventoryDates.passengers",

                    // ✅ INVENTORY MAIN FIELDS
                    agencyId: 1,
                    fareValidity: 1,
                    dateFrom: 1,
                    dateTo: 1,
                    basePrice: 1,
                    tax: 1,
                    totalPrice: 1,
                    infantPrice: 1,
                    status: 1,
                    cancellationCharges: 1,
                    rescheduleCharges: 1,

                    // ✅ SERIES REFERENCE
                    seriesId: "$series._id",
                    fareId: "$series.fareId",
                },
            },

            { $sort: { travelDate: 1 } },
        ])

        return res.status(200).json({
            status: "success",
            count: data.length,
            data,
        })
    } catch (error) {
        console.error(error)
        return res.status(500).json({
            status: "error",
            message: "Server error",
        })
    }
}

export const getCompletedInventoryDates = async (req, res) => {
    try {
        const today = new Date()
        today.setHours(0, 0, 0, 0)

        const data = await Inventory.aggregate([
            { $unwind: "$inventoryDates" },

            {
                $match: {
                    "inventoryDates.travelDate": { $lt: today },
                },
            },

            {
                $lookup: {
                    from: "series",
                    localField: "seriesId",
                    foreignField: "_id",
                    as: "series",
                },
            },
            { $unwind: { path: "$series", preserveNullAndEmptyArrays: true } },

            {
                $addFields: {
                    "inventoryDates.airlineName": {
                        $ifNull: ["$inventoryDates.airlineName", "$series.airlineName"],
                    },
                    "inventoryDates.airlineCode": {
                        $ifNull: ["$inventoryDates.airlineCode", "$series.airlineCode"],
                    },
                    "inventoryDates.airlineNumber": {
                        $ifNull: ["$inventoryDates.airlineNumber", "$series.airlineNumber"],
                    },
                    "inventoryDates.fareClass": {
                        $ifNull: ["$inventoryDates.fareClass", "$series.fareClass"],
                    },
                    "inventoryDates.fareType": {
                        $ifNull: ["$inventoryDates.fareType", "$series.fareType"],
                    },
                    "inventoryDates.fromCity": {
                        $ifNull: ["$inventoryDates.fromCity", "$series.from.city"],
                    },
                    "inventoryDates.fromCode": {
                        $ifNull: ["$inventoryDates.fromCode", "$series.from.code"],
                    },
                    "inventoryDates.toCity": {
                        $ifNull: ["$inventoryDates.toCity", "$series.to.city"],
                    },
                    "inventoryDates.toCode": {
                        $ifNull: ["$inventoryDates.toCode", "$series.to.code"],
                    },
                    "inventoryDates.departTime": {
                        $ifNull: ["$inventoryDates.departTime", "$series.departTime"],
                    },
                    "inventoryDates.arriveTime": {
                        $ifNull: ["$inventoryDates.arriveTime", "$series.arriveTime"],
                    },
                },
            },

            {
                $project: {
                    _id: 0,
                    inventoryId: "$_id",
                    inventoryDateId: "$inventoryDates._id",

                    seriesStatus: "$series.status",

                    // ✅ Use enhanced inventoryDates fields (with fallback to series)
                    airlineName: "$inventoryDates.airlineName",
                    airlineCode: "$inventoryDates.airlineCode",
                    airlineNumber: "$inventoryDates.airlineNumber",
                    fareClass: "$inventoryDates.fareClass",
                    fareType: "$inventoryDates.fareType",
                    fromCity: "$inventoryDates.fromCity",
                    fromCode: "$inventoryDates.fromCode",
                    toCity: "$inventoryDates.toCity",
                    toCode: "$inventoryDates.toCode",
                    departTime: "$inventoryDates.departTime",
                    arriveTime: "$inventoryDates.arriveTime",

                    // ✅ INVENTORY DATE FIELDS
                    travelDate: "$inventoryDates.travelDate",
                    groupCode: "$inventoryDates.groupCode",
                    pnr: "$inventoryDates.pnr",
                    seats: "$inventoryDates.seats",
                    pnrStatus: "$inventoryDates.pnrStatus",
                    passengers: "$inventoryDates.passengers",

                    // ✅ INVENTORY MAIN FIELDS
                    agencyId: 1,
                    fareValidity: 1,
                    dateFrom: 1,
                    dateTo: 1,
                    basePrice: 1,
                    tax: 1,
                    totalPrice: 1,
                    infantPrice: 1,
                    status: 1,
                    cancellationCharges: 1,
                    rescheduleCharges: 1,

                    // ✅ SERIES REFERENCE
                    seriesId: "$series._id",
                    fareId: "$series.fareId",
                },
            },

            { $sort: { travelDate: -1 } },
        ])

        return res.status(200).json({
            status: "success",
            count: data.length,
            data,
        })
    } catch (error) {
        console.error(error)
        return res.status(500).json({
            status: "error",
            message: "Server error",
        })
    }
}

export const updatePNRStatus = async (req, res) => {
    try {
        const { inventoryDateId } = req.params
        const { pnrStatus } = req.body

        // Validate status
        const validStatuses = ["available", "uploaded", "booked"]
        if (!validStatuses.includes(pnrStatus)) {
            return res.status(400).json({
                status: "fail",
                message: "Invalid PNR status",
            })
        }

        // Update embedded inventoryDates document
        const inventory = await Inventory.findOneAndUpdate(
            { "inventoryDates._id": inventoryDateId },
            {
                $set: {
                    "inventoryDates.$.pnrStatus": pnrStatus,
                },
            },
            { new: true }
        )

        if (!inventory) {
            return res.status(404).json({
                status: "fail",
                message: "Inventory date not found",
            })
        }

        // Extract updated inventoryDate
        const updatedDate = inventory.inventoryDates.find((d) => d._id.toString() === inventoryDateId)

        return res.status(200).json({
            status: "success",
            inventoryDateId: updatedDate._id,
            pnrStatus: updatedDate.pnrStatus,
        })
    } catch (error) {
        console.error("Error updating PNR status:", error)
        return res.status(500).json({
            status: "error",
            message: "Server error",
        })
    }
}

export const editSingleInventoryDate = async (req, res) => {
    try {
        const { inventoryDateId } = req.params
        const { body } = req

        const inventory = await Inventory.findOne({ "inventoryDates._id": inventoryDateId })
        if (!inventory) {
            return res.status(404).json({ status: "fail", message: "Inventory date not found" })
        }

        const inventoryDate = inventory.inventoryDates.id(inventoryDateId)

        Object.keys(body).forEach((key) => {
            if (key === "travelDate") inventoryDate[key] = new Date(body[key])
            else if (key === "seats") inventoryDate[key] = Number(body[key])
            else inventoryDate[key] = body[key]
        })

        await inventory.save()

        return res.status(200).json({
            status: "success",
            message: "Inventory date updated successfully",
            data: inventoryDate,
        })
    } catch (error) {
        return res.status(500).json({ status: "error", message: "Server error" })
    }
}

//
//temp way
// export const migrateInventoryDateSnapshots = async (req, res) => {
//     try {
//         // 1️⃣ Fetch inventories that have inventoryDates
//         const inventories = await Inventory.find({
//             inventoryDates: { $exists: true, $ne: [] },
//         }).populate("seriesId")

//         let updatedCount = 0

//         for (const inventory of inventories) {
//             const series = inventory.seriesId
//             if (!series) continue

//             let modified = false

//             inventory.inventoryDates.forEach((date) => {
//                 // 2️⃣ Only update OLD records (snapshot missing)
//                 if (!date.airlineName) {
//                     date.airlineName = series.airlineName
//                     date.airlineCode = series.airlineCode
//                     date.airlineNumber = series.airlineNumber
//                     date.fareClass = series.fareClass
//                     date.fareType = series.fareType
//                     date.fromCity = series.from?.city
//                     date.fromCode = series.from?.code
//                     date.toCity = series.to?.city
//                     date.toCode = series.to?.code
//                     date.departTime = series.departTime
//                     date.arriveTime = series.arriveTime

//                     modified = true
//                 }
//             })

//             if (modified) {
//                 await inventory.save()
//                 updatedCount++
//             }
//         }

//         return res.status(200).json({
//             status: "success",
//             message: "Inventory snapshot migration completed",
//             inventoriesUpdated: updatedCount,
//         })
//     } catch (error) {
//         console.error("Migration error:", error)
//         return res.status(500).json({
//             status: "error",
//             message: "Migration failed",
//         })
//     }
// }

export const toggleSeriesStatus = async (req, res) => {
    try {
        const { id } = req.params

        // Find the series by ID
        const series = await Series.findById(id)

        if (!series) {
            return res.status(404).json({
                status: "fail",
                message: "Series not found",
            })
        }

        // Toggle the status
        series.status = series.status === "active" ? "inactive" : "active"

        // Save the updated series
        await series.save()

        return res.status(200).json({
            status: "success",
            message: `Series status changed to ${series.status}`,
            data: {
                id: series._id,
                fareId: series.fareId,
                status: series.status,
                airline: `${series.airline?.code} - ${series.airline?.name}`,
                sector: `${series.from?.code} → ${series.to?.code}`,
            },
        })
    } catch (error) {
        console.error(error)
        return res.status(500).json({
            status: "error",
            message: "Internal Server Error",
        })
    }
}
