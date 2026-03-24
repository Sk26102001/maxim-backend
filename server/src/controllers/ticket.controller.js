import Inventory from "../models/inventory.model.js"

export const getETicketData = async (req, res) => {
    try {
        const { passengerId } = req.params

        // 1️⃣ Find inventory containing passenger
        const inventory = await Inventory.findOne({
            "inventoryDates.passengers._id": passengerId,
        })
            .populate({
                path: "seriesId",
                select: "airlineName airlineCode airlineNumber from to departTime arriveTime fareClass fareType totalDuration departAirportCode arriveAirportCode checkinBaggage cabinBaggage",
            })
            .populate({
                path: "inventoryDates.passengers.agentId",
                select: "agentName companyEmail loginID companyMobile",
            })

        if (!inventory) {
            return res.status(404).json({
                status: "fail",
                message: "Passenger not found",
            })
        }

        let inventoryDate = null
        let passenger = null

        // 2️⃣ Locate passenger & inventoryDate safely
        for (const date of inventory.inventoryDates) {
            const foundPassenger = date.passengers.find((p) => p._id.toString() === passengerId)

            if (foundPassenger) {
                inventoryDate = date
                passenger = foundPassenger
                break
            }
        }

        if (!passenger || !inventoryDate) {
            return res.status(404).json({
                status: "fail",
                message: "Passenger not found in inventory dates",
            })
        }
        // console.log(inventory.seriesId.fareType)
        // 3️⃣ Clean response (ONLY what frontend needs)
        console.log("fdg",passenger.bookingId)

        return res.status(200).json({
            status: "success",
            data: {
                passenger: {
                    _id: passenger._id,
                    title: passenger.title,
                    firstName: passenger.firstName,
                    lastName: passenger.lastName,
                    email: passenger.email,
                    phone: passenger.phone,
                    bookingId: passenger.bookingId,
                    price: passenger.price,
                    // agent: {
                    agentName: passenger.agentId.agentName,
                    companyEmail: passenger.agentId.companyEmail,
                    loginID: passenger.agentId.loginID,
                    companyMobile: passenger.agentId.companyMobile,

                    // ✅ INFANT DETAILS
                    infant: passenger.infant
                        ? {
                              title: passenger.infant.title,
                              firstName: passenger.infant.firstName,
                              lastName: passenger.infant.lastName,
                              dob: passenger.infant.dob,
                              price: passenger.infant.price,
                          }
                        : null,

                    status: passenger.status,
                },

                flight: {
                    airlineName: inventory.seriesId.airlineName,
                    airlineCode: inventory.seriesId.airlineCode,
                    airlineNumber: inventory.seriesId.airlineNumber,
                    from: inventory.seriesId.from,
                    to: inventory.seriesId.to,
                    departTime: inventory.seriesId.departTime,
                    arriveTime: inventory.seriesId.arriveTime,
                    fareClass: inventory.seriesId.fareClass,
                    fareType: inventory.seriesId.fareType,
                    duration: inventory.seriesId.totalDuration,
                    departAirportCode: inventory.seriesId.departAirportCode,
                    arriveAirportCode: inventory.seriesId.arriveAirportCode,
                    baggageTo: inventory.seriesId.checkinBaggage,
                    baggageFrom: inventory.seriesId.cabinBaggage,
                    // status: inventory.seriesId.status,
                },

                journey: {
                    travelDate: inventoryDate.travelDate,
                    pnr: inventoryDate.pnr,
                    groupCode: inventoryDate.groupCode,
                },

                pricing: {
                    basePrice: inventory.basePrice,
                    tax: inventory.tax,
                    totalPrice: inventory.totalPrice,
                    infantPrice: inventory.infantPrice,
                },
            },
        })
    } catch (error) {
        console.error("❌ E-Ticket Fetch Error:", error)
        return res.status(500).json({
            status: "error",
            message: "Failed to fetch e-ticket data",
        })
    }
}

export const getInvoiceData = async (req, res) => {
    try {
        const { passengerId } = req.params

        // Find inventory containing the passenger
        const inventory = await Inventory.findOne({
            "inventoryDates.passengers._id": passengerId,
        }).populate({
            path: "seriesId",
            select: "airlineName airlineCode airlineNumber from to departTime arriveTime fareClass",
        })

        if (!inventory) {
            return res.status(404).json({
                status: "fail",
                message: "Passenger not found",
            })
        }

        let inventoryDate = null
        let passenger = null

        // Locate passenger & inventoryDate
        for (const date of inventory.inventoryDates) {
            const foundPassenger = date.passengers.find((p) => p._id.toString() === passengerId)
            if (foundPassenger) {
                inventoryDate = date
                passenger = foundPassenger
                break
            }
        }

        if (!passenger || !inventoryDate) {
            return res.status(404).json({
                status: "fail",
                message: "Passenger not found in inventory dates",
            })
        }

        // Send clean response
        return res.status(200).json({
            status: "success",
            data: {
                passenger: {
                    _id: passenger._id,
                    title: passenger.title,
                    firstName: passenger.firstName,
                    lastName: passenger.lastName,
                    email: passenger.email,
                    infant: passenger.infant || null,
                    phone: passenger.phone,
                    price: passenger.price || inventory.totalPrice,
                    refId: passenger.refId || passenger._id,
                    agent: passenger.agent,
                },

                inventory,
                inventoryDate,
            },
        })
    } catch (error) {
        console.error("❌ Invoice Fetch Error:", error)
        return res.status(500).json({
            status: "error",
            message: "Failed to fetch invoice data",
        })
    }
}
