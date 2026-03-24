import fs from "fs"
import path from "path"
import puppeteer from "puppeteer"
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Create temp directory if it doesn't exist
const tempDir = path.join(__dirname, "../temp2")
if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true })
}

export const generateETicketPDF = async (passengerId) => {
    let browser = null
    try {
        // const url = `${process.env.FRONTEND_URL}/e-ticket/${passengerId}?pdf=true`
        const url = `${process.env.FRONTEND_URL}/vendor/e-ticket?pid=${passengerId}&pdf=true`

        // ✅ passengerId moved to route param

        browser = await puppeteer.launch({
            headless: "new",
            args: ["--no-sandbox", "--disable-setuid-sandbox"],
        })

        const page = await browser.newPage()

        // ✅ inject auth header so frontend API calls succeed
        await page.setExtraHTTPHeaders({
            Authorization: `Bearer ${process.env.PDF_JWT_TOKEN}`,
        })

        await page.goto(url, { waitUntil: "networkidle0" })
        // await page.waitForSelector(".min-h-screen", { timeout: 10000 })
        await page.waitForFunction(() => document.body.innerText.includes("E-Ticket"), { timeout: 30000 })

        const pdfBuffer = await page.pdf({
            format: "Legal",
            printBackground: true,
            margin: { top: "10mm", right: "10mm", bottom: "10mm", left: "10mm" },
        })

        const filename = `e-ticket-${passengerId}-${Date.now()}.pdf`
        const filepath = path.join(tempDir, filename)
        fs.writeFileSync(filepath, pdfBuffer)

        return { buffer: pdfBuffer, filepath, filename }
    } finally {
        if (browser) await browser.close()
    }
}

export const generateInvoicePDF = async (passengerId) => {
    let browser = null
    try {
        // const url = `${process.env.FRONTEND_URL}/invoice/${passengerId}?pdf=true`
        const url = `${process.env.FRONTEND_URL}/vendor/invoice?pid=${passengerId}&pdf=true`

        // ✅ passengerId as param

        browser = await puppeteer.launch({
            headless: "new",
            args: ["--no-sandbox", "--disable-setuid-sandbox"],
        })

        const page = await browser.newPage()

        // ✅ inject auth header so frontend API calls succeed
        await page.setExtraHTTPHeaders({
            Authorization: `Bearer ${process.env.PDF_JWT_TOKEN}`,
        })

        await page.goto(url, { waitUntil: "networkidle0" })
        // await page.waitForSelector(".min-h-screen", { timeout: 10000 })
        // await page.waitForFunction(() => document.body.innerText.includes("E-Ticket"), { timeout: 30000 })
        await page.waitForFunction(() => document.body.innerText.includes("Invoice"), { timeout: 30000 })

        const pdfBuffer = await page.pdf({
            format: "Legal",
            printBackground: true,
            margin: { top: "10mm", right: "10mm", bottom: "10mm", left: "10mm" },
        })

        const filename = `invoice-${passengerId}-${Date.now()}.pdf`
        const filepath = path.join(tempDir, filename)
        fs.writeFileSync(filepath, pdfBuffer)

        return { buffer: pdfBuffer, filepath, filename }
    } finally {
        if (browser) await browser.close()
    }
}

// Clean up temp files function
export const cleanupTempFiles = async (filepaths) => {
    for (const filepath of filepaths) {
        try {
            if (fs.existsSync(filepath)) {
                fs.unlinkSync(filepath)
            }
        } catch (error) {
            console.error(`Error deleting temp file ${filepath}:`, error)
        }
    }
}

// for payment reminder
export const generateAccountStatementPDF = async (agentId) => {
    let browser = null
    try {
        const url = `${process.env.FRONTEND_URL}/vendor/pdf-list/account-statement/${agentId}`

        browser = await puppeteer.launch({
            headless: "new",
            args: ["--no-sandbox", "--disable-setuid-sandbox"],
        })

        const page = await browser.newPage()

        // Auth header so frontend API calls succeed
        await page.setExtraHTTPHeaders({
            Authorization: `Bearer ${process.env.PDF_JWT_TOKEN}`,
        })

        // await page.goto(url, { waitUntil: "networkidle0" })

        // // 🔥 IMPORTANT: wait for something that definitely exists
        // await page.waitForFunction(() => document.body.innerText.includes("Account Statement"), { timeout: 60000 })
        await page.goto(url, { waitUntil: "networkidle0" })

        // Wait for the main table to render
        await page.waitForSelector("table", { timeout: 60000 })

        // Optional: wait until at least one row exists
        await page.waitForFunction(
            () => {
                const table = document.querySelector("table")
                return table && table.querySelectorAll("tbody tr").length > 0
            },
            { timeout: 60000 }
        )

        const pdfBuffer = await page.pdf({
            format: "Legal",
            printBackground: true,
            margin: {
                top: "10mm",
                right: "10mm",
                bottom: "10mm",
                left: "10mm",
            },
        })

        const filename = `account-statement-${agentId}-${Date.now()}.pdf`
        const filepath = path.join(tempDir, filename)

        fs.writeFileSync(filepath, pdfBuffer)

        return { buffer: pdfBuffer, filepath, filename }
    } finally {
        if (browser) await browser.close()
    }
}
