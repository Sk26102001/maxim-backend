import cron from "node-cron"
import Agent from "../models/agent.model.js"
import { sendOverdueEmail } from "../utils/overdueEmail.js"
import { getOverdueInfo } from "../utils/paymentTerms.js"

cron.schedule("0 11 * * *", async () => {
// cron.schedule("* * * * *", async () => {
    console.log("⏰ Checking overdue agents")

    const agents = await Agent.find({
        outstanding: { $lt: 0 },
        creditStartDate: { $ne: null },
        status: "active",
    })

    // console.log(agents)

    for (const agent of agents) {
        const overdue = getOverdueInfo(agent)
        if (!overdue) continue

        const today = new Date().toDateString()
        if (agent.lastOverdueEmailSent?.toDateString() === today) continue

        await sendOverdueEmail({
            agent,
            overdueDays: overdue.overdueDays,
            dueDate: overdue.dueDate,
        })

        console.log("email is sended....")

        agent.lastOverdueEmailSent = new Date()
        await agent.save()
    }
})
