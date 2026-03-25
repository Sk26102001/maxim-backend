import mongoose from "mongoose"
import InventoryLog from "../models/inventoryLog.model.js"

import Agent from "../models/agent.model.js"
import Inventory from "../models/inventory.model.js"

// Utility to format date as "1 Jan 2025"
const formatDate = (date) => {
    if (!date) return ""
    const d = new Date(date)
    const options = { day: "numeric", month: "short", year: "numeric" }
    return d.toLocaleDateString("en-GB", options)
}

export const createLog = async (req, res) => {
    try {
        const { inventoryId, inventoryDateId, action } = req.body

        //  Validation
        if (!inventoryId || !inventoryDateId || !action) {
            return res.status(400).json({ message: "Missing log data" })
        }

        // 🔹 Fetch inventory with series details
        const inventory = await Inventory.findById(inventoryId).populate("seriesId")
        if (!inventory) {
            return res.status(404).json({ message: "Inventory not found" })
        }

        // 🔹 Find requested inventory date
        const invDate = inventory.inventoryDates.find((d) => d._id.toString() === inventoryDateId)
        if (!invDate) {
            return res.status(404).json({ message: "Inventory date not found" })
        }

        const series = inventory.seriesId || {}

        // 🔹 Collect agentIds
        const agentIds = [...new Set((invDate.passengers || []).map((p) => p.agentId).filter(Boolean))]

        // 🔹 Fetch agents
        const agents = await Agent.find({ _id: { $in: agentIds } }).select("_id agentName companyEmail email")

        // 🔹 Create lookup map
        const agentMap = {}
        agents.forEach((a) => {
            agentMap[a._id.toString()] = a
        })

        // 🔹 Passenger snapshot
        const passengers = (invDate.passengers || []).map((p) => {
            const agent = p.agentId ? agentMap[p.agentId.toString()] : null
            // ✅ infant resolved by passenger _id automatically
            const infant =
                p.infant && (p.infant.firstName || p.infant.dob)
                    ? {
                          title: p.infant.title || "",
                          firstName: p.infant.firstName || "",
                          lastName: p.infant.lastName || "",
                          dob: p.infant.dob,
                          price: p.infant.price || 0,
                      }
                    : null
            console.log("Passenger Agent:", infant)

            return {
                id: p._id,
                name: `${p.title || ""} ${p.firstName || ""} ${p.lastName || ""}`.trim(),

                agent: agent
                    ? {
                          id: agent._id,
                          name: agent.agentName || "",
                          email: agent.companyEmail || agent.email || "",
                      }
                    : null,

                infant, // 👶 INCLUDED

                status: p.status || "backend",
                price: p.price || 0,
            }
        })

        // 🔹 LOG ENTRY
        const logEntry = {
            action,
            timestamp: new Date().toISOString(),

            inventory: {
                id: inventory._id,
                // agencyId: inventory.agencyId,
                // agencyId: inventory.agencyId ? inventory.agencyId.toString() : null, // cast to string
                agencyId: inventory.agencyId && mongoose.Types.ObjectId.isValid(inventory.agencyId) ? inventory.agencyId : null,

                status: inventory.status,

                airline: {
                    name: series.airlineName || "",
                    code: series.airlineCode || "",
                    flightNumber: series.airlineNumber || "",
                },

                route: {
                    from: {
                        city: series.from?.city || "",
                        code: series.from?.code || "",
                    },
                    to: {
                        city: series.to?.city || "",
                        code: series.to?.code || "",
                    },
                },

                validity: {
                    dateFrom: formatDate(inventory.dateFrom),
                    dateTo: formatDate(inventory.dateTo),
                },

                pricing: {
                    basePrice: inventory.basePrice || 0,
                    tax: inventory.tax || 0,
                    totalPrice: inventory.totalPrice || 0,
                    infantPrice: inventory.infantPrice || 0,
                },

                cancellationCharges: inventory.cancellationCharges || 0,
                rescheduleCharges: inventory.rescheduleCharges || 0,

                createdAt: formatDate(inventory.createdAt),
                updatedAt: formatDate(inventory.updatedAt),
            },

            inventoryDate: {
                id: invDate._id,
                travelDate: formatDate(invDate.travelDate),
                departureTime: series.departTime || "",
                arrivalTime: series.arriveTime || "",
                pnr: invDate.pnr || "",
                groupCode: invDate.groupCode || "",
                seats: {
                    total: invDate.seats || 0,
                    booked: (invDate.passengers || []).length,
                    available: (invDate.seats || 0) - (invDate.passengers || []).length,
                },
                status: invDate.status || "ACTIVE",
            },

            passengers,
        }

        // 🔹 Save log in DB
        const savedLog = await InventoryLog.create(logEntry)

        return res.status(201).json({
            message: "Log saved successfully",
            logId: savedLog._id,
        })
    } catch (error) {
        console.error("❌ Log Error:", error)
        return res.status(500).json({ message: "Failed to create log" })
    }
}

// export const getInventoryLogs = async (req, res) => {
//     try {
//         const { inventoryDateId } = req.params

//         const logs = await InventoryLog.find({
//             "inventoryDate.id": inventoryDateId,
//         }).sort({ createdAt: -1 })

//         return res.status(200).json({
//             status: "success",
//             count: logs.length,
//             data: logs,
//         })
//     } catch (err) {
//         return res.status(500).json({ message: "Failed to fetch logs" })
//     }
// }
export const getLogById = async (req, res) => {
    try {
        const { logId } = req.params

        if (!mongoose.Types.ObjectId.isValid(logId)) {
            return res.status(400).json({ message: "Invalid log ID" })
        }

        const log = await InventoryLog.findById(logId)

        if (!log) {
            return res.status(404).json({ message: "Log not found" })
        }

        return res.status(200).json({
            status: "success",
            data: log,
        })
    } catch (error) {
        console.error(error)
        return res.status(500).json({ message: "Failed to fetch log" })
    }
}

export const getAllInventoryLogs = async (req, res) => {
    try {
        const logs = await InventoryLog.find().sort({ createdAt: -1 }) // latest first

        return res.status(200).json({
            status: "success",
            count: logs.length,
            data: logs,
        })
    } catch (error) {
        console.error("❌ Fetch Logs Error:", error)
        return res.status(500).json({
            status: "error",
            message: "Failed to fetch logs",
        })
    }
}
