import mongoose from "mongoose"
import InventoryDate from "../models/inventory.model.js"
import { passengerSchema } from "../models/inventory.passenger.schema.js"
import { mailer } from "../utils/mailer.js"

// ✅ MUST match the model used when passengers were saved
const Passenger = mongoose.models.InventoryPassenger || mongoose.model("InventoryPassenger", passengerSchema)

export const sendPassengerEmails = async (req, res) => {
    try {
        const { inventoryDateId, passengers } = req.body

        if (!inventoryDateId || !passengers?.length) {
            return res.status(400).json({ message: "Missing required data" })
        }

        const passengerDocs = await Passenger.find({
            _id: { $in: passengers },
        })

        if (!passengerDocs.length) {
            return res.status(404).json({ message: "Passengers not found in DB" })
        }

        const inventoryDate = await InventoryDate.findById(inventoryDateId)

        if (!inventoryDate) {
            return res.status(404).json({ message: "Inventory date not found" })
        }

        let sentCount = 0

        for (const p of passengerDocs) {
            if (!p.email || p.emailStatus === "sent") continue

            await mailer.sendMail({
                from: `"Airline Inventory" <noreply@yourdomain.com>`,
                to: p.email,
                subject: `Flight Confirmation - ${inventoryDate.pnr}`,
                html: `
                    <h3>Dear ${p.title} ${p.firstName} ${p.lastName}</h3>
                    <p>Your seat <b>${p.seat}</b> has been confirmed.</p>
                    <p>PNR: ${inventoryDate.pnr}</p>
                    <p>Status: ${p.status}</p>
                `,
            })

            p.emailStatus = "sent"
            await p.save()
            sentCount++
        }

        return res.status(200).json({
            message: "Emails sent successfully",
            sentCount,
        })
    } catch (error) {
        console.error("Email Send Error:", error)
        return res.status(500).json({ message: "Failed to send email" })
    }
}
