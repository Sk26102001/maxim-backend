import fs from "fs"
import Agent from "../../models/vendor/agent.model.js"
// import Agent from "../models/agent.model.js"
import AgentCounter from "../../models/vendor/agentCounter.model.js"
// import AgentCounter from "../models/agentCounter.model.js"
import AgentTransaction from "../../models/vendor/agentTransaction.model.js"
// import AgentTransaction from "../models/agentTransaction.model.js"

async function getNextAgentId() {
    const counter = await AgentCounter.findOneAndUpdate({ name: "agentId" }, { $inc: { seq: 1 } }, { new: true, upsert: true })

    const paddedNumber = String(counter.seq).padStart(3, "0")
    return `AMT${paddedNumber}`
}

export const addAgent = async (req, res) => {
    try {
        const { body, files } = req

        const gstFilePath = files.gstFile ? files.gstFile[0].path.replace(/\\/g, "/") : null
        const panFilePath = files.panFile ? files.panFile[0].path.replace(/\\/g, "/") : null
        const aadharFilePath = files.aadharFile ? files.aadharFile[0].path.replace(/\\/g, "/") : null

        const gstFile = gstFilePath ? `${req.protocol}://${req.get("host")}/${gstFilePath}` : null
        const panFile = panFilePath ? `${req.protocol}://${req.get("host")}/${panFilePath}` : null
        const aadharFile = aadharFilePath ? `${req.protocol}://${req.get("host")}/${aadharFilePath}` : null

        await Agent.create({
            ...body,
            gstFile,
            panFile,
            aadharFile,
            gstFilePath,
            panFilePath,
            aadharFilePath,
        })

        res.status(200).json({ success: true, message: "Agent added successfully" })
    } catch (error) {
        res.status(500).json({ success: false, message: error.message })
    }
}

export const getAllAgents = async (req, res) => {
    try {
        const agents = await Agent.find()
        const agentCount = await Agent.countDocuments()
        res.status(200).json({ agents, agentCount })
    } catch (error) {
        res.status(500).json({ success: false, message: error.message })
    }
}

export const getAgentById = async (req, res) => {
    try {
        const { id } = req.params
        const agent = await Agent.findById(id)
        res.status(200).json({ agent })
    } catch (error) {
        res.status(500).json({ success: false, message: error.message })
    }
}

export const deleteAgent = async (req, res) => {
    try {
        const { id } = req.params

        const agent = await Agent.findById(id)
        if (!agent) {
            return res.status(404).json({ success: false, message: "Agent not found" })
        }
        const filesToDelete = [agent.panFilePath, agent.gstFilePath, agent.aadharFilePath]
        filesToDelete.forEach((filePath) => {
            if (filePath && fs.existsSync(filePath)) {
                try {
                    fs.unlinkSync(filePath)
                } catch (err) {
                    console.error(`Failed to delete file ${filePath}:`, err.message)
                }
            }
        })

        await AgentTransaction.deleteMany({ agentId: id })
        await Agent.findByIdAndDelete(id)

        res.status(200).json({
            success: true,
            message: "Agent and associated files deleted successfully",
        })
    } catch (error) {
        console.error("Error deleting agent:", error)
        res.status(500).json({ success: false, message: error.message })
    }
}

export const changeAgentPassword = async (req, res) => {
    try {
        const { id } = req.params
        const { password: newPassword } = req.body
        const agent = await Agent.findById(id)
        if (!agent) {
            return res.status(404).json({ success: false, message: "Agent not found" })
        }
        agent.password = newPassword
        await agent.save()
        res.status(200).json({ success: true, message: "Password changed successfully" })
    } catch (error) {
        res.status(500).json({ success: false, message: error.message })
    }
}

// export const depositAmount = async (req, res) => {
//     try {
//         const { id } = req.params
//         const { amount, remark, paymentMode, date } = req.body
//         const ref = await getNextAgentId()
//         const agent = await Agent.findById(id)
//         if (!agent) {
//             return res.status(404).json({ success: false, message: "Agent not found" })
//         }

//         let newBalance
//         let type
//         if (paymentMode === "purchase") {
//             newBalance = agent.outstanding - +amount
//             type = "debit"
//         } else {
//             newBalance = agent.outstanding + +amount
//             type = "credit"
//         }
//         await AgentTransaction.create({ agentId: agent._id, amount, remark, paymentMode, date, type, balance: newBalance, ref })
//         agent.outstanding = newBalance
//         await agent.save()
//         res.status(200).json({ success: true, message: "Amount deposited successfully" })
//     } catch (error) {
//         res.status(500).json({ success: false, message: error.message })
//     }
// }
// export const deductAmount = async (req, res) => {
//     try {
//         const { id } = req.params
//         const { amount, remark, paymentMode, date } = req.body
//         const ref = await getNextAgentId()
//         const agent = await Agent.findById(id)
//         if (!agent) {
//             return res.status(404).json({ success: false, message: "Agent not found" })
//         }
//         const newBalance = agent.outstanding - +amount
//         await AgentTransaction.create({ agentId: agent._id, amount, remark, paymentMode, date, type: "debit", balance: newBalance, ref })
//         agent.outstanding -= +amount
//         await agent.save()
//         res.status(200).json({ success: true, message: "Amount Deducted successfully" })
//     } catch (error) {
//         res.status(500).json({ success: false, message: error.message })
//     }
// }

export const depositAmount = async (req, res) => {
    try {
        const { id } = req.params
        const { amount, remark, paymentMode, date, transactionDetails } = req.body // include transactionDetails
        const ref = await getNextAgentId()
        const agent = await Agent.findById(id)
        if (!agent) {
            return res.status(404).json({ success: false, message: "Agent not found" })
        }

        let newBalance
        let type
        if (paymentMode === "purchase") {
            newBalance = agent.outstanding - +amount
            type = "debit"
        } else {
            newBalance = agent.outstanding + +amount
            type = "credit"
        }

        // START credit tracking
        if (newBalance < 0 && !agent.creditStartDate) {
            agent.creditStartDate = new Date()
        }

        // RESET credit tracking
        if (newBalance >= 0) {
            agent.creditStartDate = null
            agent.lastOverdueEmailSent = null
        }

        await AgentTransaction.create({
            agentId: agent._id,
            amount,
            remark,
            paymentMode,
            date,
            type,
            balance: newBalance,
            ref,
            transactionDetails: transactionDetails || undefined, // optional
        })

        agent.outstanding = newBalance
        await agent.save()
        res.status(200).json({ success: true, message: "Amount deposited successfully" })
    } catch (error) {
        res.status(500).json({ success: false, message: error.message })
    }
}

export const deductAmount = async (req, res) => {
    try {
        const { id } = req.params
        const { amount, remark, paymentMode, date, transactionDetails } = req.body // include transactionDetails
        const ref = await getNextAgentId()
        const agent = await Agent.findById(id)
        if (!agent) {
            return res.status(404).json({ success: false, message: "Agent not found" })
        }

        const newBalance = agent.outstanding - +amount

        await AgentTransaction.create({
            agentId: agent._id,
            amount,
            remark,
            paymentMode,
            date,
            type: "debit",
            balance: newBalance,
            ref,
            transactionDetails: transactionDetails || undefined, // optional
        })

        // START credit tracking
        if (newBalance < 0 && !agent.creditStartDate) {
            agent.creditStartDate = new Date()
        }

        // RESET credit tracking
        if (newBalance >= 0) {
            agent.creditStartDate = null
            agent.lastOverdueEmailSent = null
        }

        agent.outstanding = newBalance
        await agent.save()
        res.status(200).json({ success: true, message: "Amount Deducted successfully" })
    } catch (error) {
        res.status(500).json({ success: false, message: error.message })
    }
}

export const allTransactions = async (req, res) => {
    try {
        const { id } = req.params
        const agent = await Agent.findById(id)
        if (!agent) {
            return res.status(404).json({ success: false, message: "Agent not found" })
        }
        const transactions = await AgentTransaction.find({ agentId: agent._id })
        res.status(200).json({ success: true, transactions })
    } catch (error) {
        res.status(500).json({ success: false, message: error.message })
    }
}

// for payment reminder

import { sendOverdueEmail } from "../../utils/overdueEmail.js"
import { getOverdueInfo } from "../../utils/paymentTerms.js"

export const runOverdueCheckManually = async (req, res) => {
    try {
        const agents = await Agent.find({
            outstanding: { $lt: 0 },
            creditStartDate: { $ne: null },
            status: "active",
        })
        console.log(agents)

        const result = []

        // for (const agent of agents) {
        //     const overdue = getOverdueInfo(agent)
        //     if (!overdue) continue

        for (const agent of agents) {
            // 🔥 FORCE overdue calculation for manual run
            const tempAgent = {
                ...agent.toObject(),
                creditStartDate: new Date("2024-01-01"),
            }

            const overdue = getOverdueInfo(tempAgent)
            if (!overdue) continue

            await sendOverdueEmail({
                agent,
                overdueDays: overdue.overdueDays,
                dueDate: overdue.dueDate,
            })

            agent.lastOverdueEmailSent = new Date()
            await agent.save()

            result.push({
                agent: agent.agentName,
                overdueDays: overdue.overdueDays,
                outstanding: agent.outstanding,
            })
        }

        res.json({
            success: true,
            message: "Manual overdue check executed",
            sent: result.length,
            result,
        })
    } catch (error) {
        res.status(500).json({ success: false, message: error.message })
    }
}
