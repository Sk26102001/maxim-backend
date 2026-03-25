// controllers/passenger.controller.js
import Agent from "../../models/vendor/agent.model.js"
import Inventory from "../../models/vendor/inventory.model.js"
import { sendInvoiceEmail, sendPassengerEmail } from "../../utils/sendMail2.js"

export const addPassenger = async (req, res) => {
    try {
        const { inventoryId, inventoryDateId } = req.params
        const passengerData = req.body
        const { agentId } = passengerData // agentId sent from frontend

        // 1️⃣ Find inventory
        const inventory = await Inventory.findById(inventoryId)
        if (!inventory) {
            return res.status(404).json({
                status: "fail",
                message: "Inventory not found",
            })
        }

        // 2️⃣ Find inventory date
        const inventoryDate = inventory.inventoryDates.id(inventoryDateId)
        if (!inventoryDate) {
            return res.status(404).json({
                status: "fail",
                message: "Inventory date not found",
            })
        }

        // ✅ Ensure passengers array exists
        if (!Array.isArray(inventoryDate.passengers)) {
            inventoryDate.passengers = []
        }

        // 3️⃣ Seat availability check
        if (inventoryDate.passengers.length >= inventoryDate.seats) {
            return res.status(400).json({
                status: "fail",
                message: "No seats available",
            })
        }

        // 4️⃣ Validate agent
        if (!agentId) {
            return res.status(400).json({
                status: "fail",
                message: "Agent ID is required",
            })
        }

        const agent = await Agent.findById(agentId)
        if (!agent) {
            return res.status(404).json({
                status: "fail",
                message: "Agent not found",
            })
        }

        // 5️⃣ Add agent info to passenger data
        passengerData.agent = {
            id: agent._id,
            name: agent.agentName,
            email: agent.companyEmail,
        }

        // 6️⃣ Add inventory reference (SAFE)
        passengerData.inventoryId = inventoryId

        // 7️⃣ Push passenger
        inventoryDate.passengers.push(passengerData)

        // 👇 Get newly added passenger
        const newPassenger = inventoryDate.passengers.at(-1)

        // ✅ Generate bookingId using passenger _id
        newPassenger.bookingId = `AMT-${newPassenger._id}`

        await inventory.save()

        return res.status(201).json({
            status: "success",
            message: "Passenger added successfully",
            data: inventoryDate.passengers.at(-1),
        })
    } catch (error) {
        console.error(error)
        return res.status(500).json({
            status: "error",
            message: "Internal server error",
        })
    }
}

export const getPassengersByInventoryDate = async (req, res) => {
    try {
        const { inventoryId, inventoryDateId } = req.params

        const inventory = await Inventory.findById(inventoryId).populate({
            path: "inventoryDates.passengers.agentId",
            select: "agentName companyEmail loginID companyMobile",
        })

        if (!inventory) {
            return res.status(404).json({
                status: "fail",
                message: "Inventory not found",
            })
        }

        const inventoryDate = inventory.inventoryDates.id(inventoryDateId)
        if (!inventoryDate) {
            return res.status(404).json({
                status: "fail",
                message: "Inventory date not found",
            })
        }

        // const passengers = Array.isArray(inventoryDate.passengers) ? inventoryDate.passengers : []
        const passengers = Array.isArray(inventoryDate.passengers)
            ? inventoryDate.passengers.map((p) => ({
                  ...p.toObject(),
                  refId: p._id, // 👈 add this line
              }))
            : []

        return res.status(200).json({
            status: "success",
            count: passengers.length,
            data: passengers,
        })
    } catch (error) {
        console.error(error)
        return res.status(500).json({
            status: "error",
            message: "Internal server error",
        })
    }
}

export const updatePassenger = async (req, res) => {
    try {
        const { inventoryId, inventoryDateId, passengerId } = req.params
        const updateData = req.body

        const inventory = await Inventory.findById(inventoryId)
        if (!inventory) return res.status(404).json({ message: "Inventory not found" })

        const inventoryDate = inventory.inventoryDates.id(inventoryDateId)
        if (!inventoryDate) return res.status(404).json({ message: "Inventory date not found" })

        const passenger = inventoryDate.passengers.id(passengerId)
        if (!passenger) return res.status(404).json({ message: "Passenger not found" })

        // Update fields
        Object.assign(passenger, updateData)

        await inventory.save()

        return res.status(200).json({
            status: "success",
            message: "Passenger updated successfully",
            data: passenger,
        })
    } catch (error) {
        console.error(error)
        return res.status(500).json({ status: "error", message: "Internal server error" })
    }
}

export const sendPassengerEmails = async (req, res) => {
    try {
        const { inventoryId, inventoryDateId, passengerIds, emailData } = req.body

        if (!inventoryId || !inventoryDateId || !Array.isArray(passengerIds) || !passengerIds.length) {
            return res.status(400).json({
                status: "fail",
                message: "Missing required data: inventoryId, inventoryDateId, passengerIds",
            })
        }

        const inventory = await Inventory.findById(inventoryId)
            .populate({
                path: "seriesId",
                select: "airlineName fareId from to",
            })
            .populate({
                path: "inventoryDates.passengers.agentId",
                select: "agentName companyEmail",
            })

        if (!inventory)
            return res.status(404).json({
                status: "fail",
                message: "Inventory not found",
            })

        const inventoryDate = inventory.inventoryDates.id(inventoryDateId)
        if (!inventoryDate)
            return res.status(404).json({
                status: "fail",
                message: "Inventory date not found",
            })

        const selectedPassengers = inventoryDate.passengers.filter((p) => passengerIds.includes(p._id.toString()))

        if (!selectedPassengers.length) {
            return res.status(404).json({
                status: "fail",
                message: "No passengers found with the provided IDs",
            })
        }

        let sentCount = 0
        let failedCount = 0
        const errors = []

        for (const passenger of selectedPassengers) {
            try {
                const passengerId = passenger._id.toString()

                // Get custom email and subject from frontend
                const customData = emailData?.[passengerId] || {}
                const email = customData.email || passenger.agentId?.companyEmail
                let subject = customData.subject

                // If no custom subject provided, generate default
                if (!subject) {
                    const fareId = inventory.seriesId?.fareId || "N/A"
                    const travelDate = new Date(inventoryDate.travelDate).toLocaleDateString("en-IN")
                    const pnr = inventoryDate.pnr || "N/A"
                    subject = `Inventory Booking / ${fareId} / ${travelDate} / ${pnr} / 1 seat`
                }

                console.log(`📧 Processing email for passenger ${passenger.firstName}:`, { email, subject })

                if (!email) {
                    errors.push({
                        passengerId: passengerId,
                        passengerName: `${passenger.firstName} ${passenger.lastName}`,
                        error: "No email address found",
                    })
                    failedCount++
                    continue
                }

                // Validate email format
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
                if (!emailRegex.test(email)) {
                    errors.push({
                        passengerId: passengerId,
                        passengerName: `${passenger.firstName} ${passenger.lastName}`,
                        error: `Invalid email format: ${email}`,
                    })
                    failedCount++
                    continue
                }

                // Check if email is already sent
                if (passenger.emailStatus === "sent") {
                    console.log(`ℹ️ Email already sent for ${passenger.firstName}`)
                    sentCount++ // Count as successful even if already sent
                    continue
                }

                // Send email with custom subject
                await sendPassengerEmail({
                    passenger: {
                        ...passenger.toObject(),
                        email,
                        subject,
                    },
                    inventory,
                    inventoryDate,
                })

                // Update passenger status
                passenger.emailStatus = "sent"
                sentCount++

                console.log(`✅ Email sent successfully to ${email}`)
            } catch (error) {
                console.error(`❌ Error sending email for passenger ${passenger.firstName}:`, error)
                errors.push({
                    passengerId: passenger._id.toString(),
                    passengerName: `${passenger.firstName} ${passenger.lastName}`,
                    error: error.message,
                })
                failedCount++
            }
        }

        // Save all changes to database
        await inventory.save()

        return res.status(200).json({
            status: "success",
            message: "Emails processed successfully",
            data: {
                totalSelected: selectedPassengers.length,
                sentCount,
                failedCount,
                errors: errors.length > 0 ? errors : undefined,
            },
        })
    } catch (error) {
        console.error("❌ Email Send Error:", error)
        return res.status(500).json({
            status: "error",
            message: "Failed to send emails",
            error: error.message,
        })
    }
}

export const sendPassengerInvoiceEmails = async (req, res) => {
    try {
        const { inventoryId, inventoryDateId, passengerIds, emailData } = req.body

        if (!inventoryId || !inventoryDateId || !Array.isArray(passengerIds) || !passengerIds.length) {
            return res.status(400).json({
                status: "fail",
                message: "Missing required data: inventoryId, inventoryDateId, passengerIds",
            })
        }

        const inventory = await Inventory.findById(inventoryId)
            .populate({
                path: "seriesId",
                select: "airlineName fareId from to",
            })
            .populate({
                path: "inventoryDates.passengers.agentId",
                select: "agentName companyEmail",
            })

        if (!inventory)
            return res.status(404).json({
                status: "fail",
                message: "Inventory not found",
            })

        const inventoryDate = inventory.inventoryDates.id(inventoryDateId)
        if (!inventoryDate)
            return res.status(404).json({
                status: "fail",
                message: "Inventory date not found",
            })

        const selectedPassengers = inventoryDate.passengers.filter((p) => passengerIds.includes(p._id.toString()))

        if (!selectedPassengers.length) {
            return res.status(404).json({
                status: "fail",
                message: "No passengers found with the provided IDs",
            })
        }

        let sentCount = 0
        let failedCount = 0
        const errors = []

        for (const passenger of selectedPassengers) {
            try {
                const passengerId = passenger._id.toString()

                // Get custom email and subject from frontend
                const customData = emailData?.[passengerId] || {}
                const email = customData.email || passenger.agentId?.companyEmail
                let subject = customData.subject

                // If no custom subject provided, generate default
                if (!subject) {
                    subject = `Invoice - ${passenger.refId || passenger._id}`
                }

                console.log(`📧 Processing invoice email for passenger ${passenger.firstName}:`, { email, subject })

                if (!email) {
                    errors.push({
                        passengerId: passengerId,
                        passengerName: `${passenger.firstName} ${passenger.lastName}`,
                        error: "No email address found",
                    })
                    failedCount++
                    continue
                }

                // Validate email format
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
                if (!emailRegex.test(email)) {
                    errors.push({
                        passengerId: passengerId,
                        passengerName: `${passenger.firstName} ${passenger.lastName}`,
                        error: `Invalid email format: ${email}`,
                    })
                    failedCount++
                    continue
                }

                // Check if invoice email is already sent
                if (passenger.invoiceEmailStatus === "sent") {
                    console.log(`ℹ️ Invoice already sent for ${passenger.firstName}`)
                    sentCount++ // Count as successful even if already sent
                    continue
                }

                // Send invoice email with custom subject
                await sendInvoiceEmail({
                    passenger: {
                        ...passenger.toObject(),
                        email,
                        subject,
                    },
                    inventory,
                    inventoryDate,
                })

                // Update passenger invoice status
                passenger.invoiceEmailStatus = "sent"
                sentCount++

                console.log(`✅ Invoice email sent successfully to ${email}`)
            } catch (error) {
                console.error(`❌ Error sending invoice for passenger ${passenger.firstName}:`, error)
                errors.push({
                    passengerId: passenger._id.toString(),
                    passengerName: `${passenger.firstName} ${passenger.lastName}`,
                    error: error.message,
                })
                failedCount++
            }
        }

        // Save all changes to database
        await inventory.save()

        return res.status(200).json({
            status: "success",
            message: "Invoice emails processed successfully",
            data: {
                totalSelected: selectedPassengers.length,
                sentCount,
                failedCount,
                errors: errors.length > 0 ? errors : undefined,
            },
        })
    } catch (error) {
        console.error("❌ Invoice Email Error:", error)
        return res.status(500).json({
            status: "error",
            message: "Failed to send invoice emails",
            error: error.message,
        })
    }
}

export const addOrUpdateInfant = async (req, res) => {
    try {
        const { inventoryId, inventoryDateId, passengerId } = req.params
        const { title, firstName, lastName, dob, price } = req.body

        if (!firstName || !dob) {
            return res.status(400).json({
                status: "fail",
                message: "Infant first name and date of birth are required",
            })
        }

        const inventory = await Inventory.findById(inventoryId)
        if (!inventory) return res.status(404).json({ message: "Inventory not found" })

        const inventoryDate = inventory.inventoryDates.id(inventoryDateId)
        if (!inventoryDate) return res.status(404).json({ message: "Inventory date not found" })

        const passenger = inventoryDate.passengers.id(passengerId) || inventoryDate.passengers.find((p) => p._id.toString() === passengerId)

        if (!passenger) {
            return res.status(404).json({ message: "Passenger not found" })
        }

        passenger.infant = {
            title: title || "Mr",
            firstName,
            lastName: lastName || "",
            dob,
            price: price ?? 1750,
        }

        await inventory.save()

        return res.status(200).json({
            status: "success",
            message: "Infant details saved successfully",
            data: passenger.infant,
        })
    } catch (error) {
        console.error("Add/Update Infant Error:", error)
        return res.status(500).json({
            status: "error",
            message: "Internal server error",
        })
    }
}

//
//
//
//
//
//

// temp method to add booking id to old passengers
// export const addBookingIdToAllPassengers = async (req, res) => {
//     try {
//         const inventories = await Inventory.find({})

//         let updatedCount = 0

//         for (const inventory of inventories) {
//             for (const invDate of inventory.inventoryDates) {
//                 if (!Array.isArray(invDate.passengers)) continue

//                 for (const passenger of invDate.passengers) {
//                     if (!passenger.bookingId) {
//                         passenger.bookingId = `AMT-${passenger._id}`
//                         updatedCount++
//                     }
//                 }
//             }

//             await inventory.save()
//         }

//         return res.status(200).json({
//             status: "success",
//             message: `Booking IDs added to ${updatedCount} passengers`,
//         })
//     } catch (err) {
//         console.error(err)
//         return res.status(500).json({
//             status: "error",
//             message: "Failed to add booking IDs",
//         })
//     }
// }
