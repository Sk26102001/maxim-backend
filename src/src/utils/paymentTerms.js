export const PAYMENT_TERM_DAYS = {
    monday: 1,
    tuesday: 2,
    wednesday: 3,
    thursday: 4,
    friday: 5,
    saturday: 6,
    sunday: 7,
}

export function getOverdueInfo(agent) {
    if (!agent.creditStartDate) return null

    const termDays = PAYMENT_TERM_DAYS[agent.paymentTerms?.toLowerCase()]
    if (!termDays) return null

    const now = new Date()
    const dueDate = new Date(agent.creditStartDate)
    dueDate.setDate(dueDate.getDate() + termDays)

    const overdueMs = now - dueDate
    if (overdueMs <= 0) return null

    const overdueDays = Math.floor(overdueMs / (1000 * 60 * 60 * 24)) + 1

    return { dueDate, overdueDays }
}
