import nodemailer from "nodemailer"
import path from "path"
import { fileURLToPath } from "url"
import { cleanupTempFiles, generateETicketPDF, generateInvoicePDF } from "./pdfGenerator2.js"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

/* ===============================
   SHARED TRANSPORTER (ZOHO SMTP)
================================ */
const transporter = nodemailer.createTransport({
    host: "smtp.zeptomail.com",
    port: 465,
    secure: true,
    auth: {
        user: process.env.ZOHO_EMAIL,
        pass: process.env.ZOHO_APP_PASSWORD,
    },
})

// Verify transporter on startup
transporter.verify((err) => {
    if (err) {
        console.error("❌ Zoho SMTP Error:", err)
    } else {
        console.log("✅ Zoho SMTP Ready")
    }
})

/* ===============================
   PASSENGER CONFIRMATION EMAIL WITH E-TICKET PDF
================================ */
export const sendPassengerEmail = async ({ passenger, inventory, inventoryDate }) => {
    let pdfInfo = null
    try {
        if (!passenger?.email) {
            throw new Error("Passenger email missing")
        }

        // Generate e-ticket PDF
        console.log(`🔄 Generating e-ticket PDF for passenger ${passenger.firstName}...`)
        pdfInfo = await generateETicketPDF(passenger._id.toString())
        console.log(`✅ PDF generated: ${pdfInfo.filename}`)

        // Get inventory details for email content
        const airlineName = inventory?.seriesId?.airlineName || "Airline"
        const fromCity = inventory?.seriesId?.from?.city || "Origin"
        const toCity = inventory?.seriesId?.to?.city || "Destination"
        const travelDate = inventoryDate?.travelDate ? new Date(inventoryDate.travelDate).toLocaleDateString("en-IN") : "N/A"
        const pnr = inventoryDate?.pnr || "N/A"
        const fareId = inventory?.seriesId?.fareId || "N/A"

        //  Calculate total amount (passenger price + infant price)
        const passengerPrice = Number(passenger.price) || 0
        const infantPrice = passenger.infant?.firstName && passenger.infant?.lastName && passenger.infant?.dob && passenger.infant?.price ? Number(passenger.infant.price) : 0
        const totalAmount = passengerPrice + infantPrice

        // Determine if infant is present
        const hasInfant = passenger.infant && (passenger.infant.firstName || passenger.infant.price)
        const infantName = hasInfant ? `${passenger.infant.firstName || "No infant"}` : null

        const html = `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #1a56db; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
        .details { background: white; padding: 20px; border-radius: 6px; margin: 20px 0; }
        .detail-row { display: flex; margin-bottom: 10px; }
        .label { font-weight: bold; color: #4b5563; width: 150px; }
        .value { color: #111827; }
        .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 14px; }
        .highlight { background: #dbeafe; padding: 10px; border-radius: 4px; margin: 15px 0; }
        .attachment { background: #f0f9ff; padding: 15px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #0ea5e9; }
        .total-row { background: #f0f9ff; padding: 10px; border-radius: 4px; margin: 15px 0; border-left: 4px solid #10b981; }

        /* ===============================
           RESPONSIVE EMAIL STYLES
        =============================== */
        @media only screen and (max-width: 600px) {
            body { margin: 0 !important; padding: 0 !important; }
            .container { width: 100% !important; padding: 10px !important; }
            .header, .invoice-header { padding: 15px !important; text-align: center !important; }
            .header h1, .invoice-title { font-size: 20px !important; }
            .content, .invoice-body { padding: 15px !important; }
            .info-grid { display: block !important; }
            .info-item { width: 100% !important; margin-bottom: 10px !important; }
            .detail-row { flex-direction: column !important; margin-bottom: 12px !important; }
            .label { width: 100% !important; margin-bottom: 4px !important; font-size: 13px !important; }
            .value { font-size: 14px !important; }
            .table { display: block !important; width: 100% !important; overflow-x: auto !important; white-space: nowrap !important; font-size: 13px !important; }
            .table th, .table td { padding: 8px !important; }
            .section, .details, .attachment, .highlight, .terms { padding: 15px !important; }
            .footer { font-size: 12px !important; text-align: center !important; }
            p { font-size: 14px !important; line-height: 1.5 !important; }
            h3 { font-size: 16px !important; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Flight Booking Confirmation</h1>
        </div>
        <div class="content">
            <p>Dear ${passenger.title} ${passenger.firstName} ${passenger.lastName || ""},</p>

            <div class="highlight">
                <p style="margin: 0; font-weight: bold;">Your flight booking has been confirmed!</p>
            </div>

            <div class="attachment">
                <h3 style="color: #0ea5e9; margin-top: 0;">📎 E-Ticket Attachment</h3>
                <p>Your e-ticket is attached to this email as a PDF file.</p>
                <p style="font-size: 12px; color: #6b7280; margin-top: 8px;">
                    <strong>File:</strong> ${pdfInfo.filename}<br>
                    <strong>Please print this e-ticket or save it on your mobile device.</strong>
                </p>
            </div>

            <div class="details">
                <h3 style="color: #1a56db; margin-top: 0;">Booking Details</h3>

                <div class="detail-row">
                    <div class="label">Passenger Name:</div>
                    <div class="value">${passenger.title} ${passenger.firstName} ${passenger.lastName || ""}</div>
                </div>

                ${
                    hasInfant
                        ? `
                <div class="detail-row">
                    <div class="label">Infant Name:</div>
                    <div class="value">${infantName}</div>
                </div>
                `
                        : ""
                }

                <div class="detail-row">
                    <div class="label">Reference ID:</div>
                    <div class="value">${passenger.refId || "N/A"}</div>
                </div>

                <div class="detail-row">
                    <div class="label">Seat Number:</div>
                    <div class="value">${passenger.seat || "-"}</div>
                </div>

                <div class="detail-row">
                    <div class="label">Booking Status:</div>
                    <div class="value" style="color: #059669; font-weight: bold;">${passenger.status?.toUpperCase() || "CONFIRMED"}</div>
                </div>

                <div class="detail-row">
                    <div class="label">Airline:</div>
                    <div class="value">${airlineName}</div>
                </div>

                <div class="detail-row">
                    <div class="label">Route:</div>
                    <div class="value">${fromCity} → ${toCity}</div>
                </div>

                <div class="detail-row">
                    <div class="label">Travel Date:</div>
                    <div class="value">${travelDate}</div>
                </div>

                <div class="detail-row">
                    <div class="label">PNR:</div>
                    <div class="value">${pnr}</div>
                </div>

                <div class="detail-row">
                    <div class="label">Fare ID:</div>
                    <div class="value">${fareId}</div>
                </div>

                ${
                    passengerPrice > 0 || infantPrice > 0
                        ? `
                <div class="total-row">
                    <h3 style="color: #10b981; margin-top: 0; margin-bottom: 10px;">Payment Summary</h3>

                    ${
                        passengerPrice > 0
                            ? `
                    <div class="detail-row">
                        <div class="label">Passenger Fare:</div>
                        <div class="value">₹${passengerPrice.toLocaleString("en-IN")}</div>
                    </div>
                    `
                            : ""
                    }

                    ${
                        infantPrice > 0
                            ? `
                    <div class="detail-row">
                        <div class="label">Infant Charge:</div>
                        <div class="value">₹${infantPrice.toLocaleString("en-IN")}</div>
                    </div>
                    `
                            : ""
                    }

                    <div class="detail-row">
                        <div class="label" style="font-weight: bold; font-size: 16px;">Total Amount:</div>
                        <div class="value" style="font-weight: bold; font-size: 16px; color: #059669;">₹${totalAmount.toLocaleString("en-IN")}</div>
                    </div>
                </div>
                `
                        : ""
                }
            </div>

            <p><strong>Important:</strong> Please carry a valid government-issued photo ID to the airport along with your e-ticket.</p>

            ${
                hasInfant
                    ? `
            <div class="highlight">
                <p style="margin: 0; font-weight: bold;">Infant Travel Notice:</p>
                <p style="margin: 5px 0 0 0; font-size: 14px;">Please carry the infant's birth certificate or any valid age proof document for verification.</p>
            </div>
            `
                    : ""
            }

            <div class="footer">
                <p>Thank you for choosing our services.</p>
                <p>For any queries, please contact our support team.</p>
                <p><strong>Safe Travels!</strong></p>
            </div>
        </div>
    </div>
</body>
</html>
        `

        const text = `
Dear ${passenger.title} ${passenger.firstName} ${passenger.lastName || ""},

Your flight booking has been confirmed!

📎 E-TICKET ATTACHMENT
Your e-ticket is attached to this email as a PDF file (${pdfInfo.filename}).
Please print this e-ticket or save it on your mobile device.

PASSENGER DETAILS:
- Name: ${passenger.title} ${passenger.firstName} ${passenger.lastName || ""}
- Reference ID: ${passenger.refId || "N/A"}
- Seat Number: ${passenger.seat || "-"}
- Status: ${passenger.status?.toUpperCase() || "CONFIRMED"}

FLIGHT DETAILS:
- Airline: ${airlineName}
- Route: ${fromCity} → ${toCity}
- Travel Date: ${travelDate}
- PNR: ${pnr}
- Fare ID: ${fareId}
${passenger.price ? `- Amount Paid: ₹${passenger.price.toLocaleString("en-IN")}` : ""}

IMPORTANT: Please carry a valid government-issued photo ID to the airport along with your e-ticket.

Thank you for choosing our services.
Safe Travels!
        `

        const mailOptions = {
            from: `"${process.env.EMAIL_NAME || "Flight Booking"}" <${process.env.EMAIL_FROM}>`,
            to: passenger.email,
            subject: passenger.subject || "Flight Booking Confirmation - E-Ticket Attached",
            text: text,
            html: html,
            attachments: [
                {
                    filename: pdfInfo.filename,
                    content: pdfInfo.buffer,
                    contentType: "application/pdf",
                },
            ],
        }

        const info = await transporter.sendMail(mailOptions)

        console.log(`✅ Passenger email sent with e-ticket: ${passenger.email}`, {
            messageId: info.messageId,
            subject: mailOptions.subject,
            attachment: pdfInfo.filename,
        })

        return info
    } catch (error) {
        console.error("❌ Passenger email failed:", {
            passengerEmail: passenger.email,
            error: error.message,
            subject: passenger.subject,
        })
        throw error
    } finally {
        // Clean up temp file
        if (pdfInfo && pdfInfo.filepath) {
            await cleanupTempFiles([pdfInfo.filepath])
        }
    }
}

/* ===============================
   INVOICE EMAIL WITH PDF ATTACHMENT
================================ */
export const sendInvoiceEmail = async ({ passenger, inventory, inventoryDate }) => {
    let pdfInfo = null
    try {
        if (!passenger?.email) {
            throw new Error("Passenger email missing")
        }

        // Generate invoice PDF
        console.log(`🔄 Generating invoice PDF for passenger ${passenger.firstName}...`)
        pdfInfo = await generateInvoicePDF(passenger._id.toString())
        console.log(`✅ PDF generated: ${pdfInfo.filename}`)

        // Get inventory details
        const airlineName = inventory?.seriesId?.airlineName || "Airline"
        const fromCity = inventory?.seriesId?.from?.city || "Origin"
        const toCity = inventory?.seriesId?.to?.city || "Destination"
        const travelDate = inventoryDate?.travelDate ? new Date(inventoryDate.travelDate).toLocaleDateString("en-IN") : "N/A"
        const pnr = inventoryDate?.pnr || "N/A"

        // Calculate total amount (passenger price + infant price)
        const passengerPrice = Number(passenger.price) || 0
        const infantPrice = passenger.infant?.price ? Number(passenger.infant.price) : 0
        const totalAmount = passengerPrice + infantPrice

        // Generate invoice number
        const invoiceNumber = `INV-${passenger.refId || passenger._id}-${Date.now().toString().slice(-6)}`
        const invoiceDate = new Date().toLocaleDateString("en-IN")

        const html = `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 700px; margin: 0 auto; padding: 20px; }
        .invoice-header { background: #1e40af; color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .invoice-title { font-size: 28px; margin: 0; }
        .invoice-body { background: #f8fafc; padding: 30px; border-radius: 0 0 8px 8px; }
        .section { background: white; padding: 25px; border-radius: 6px; margin-bottom: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
        .section-title { color: #1e40af; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px; margin-top: 0; }
        .info-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; }
        .info-item { margin-bottom: 12px; }
        .label { font-weight: bold; color: #4b5563; display: inline-block; width: 160px; }
        .value { color: #111827; }
        .table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        .table th { background: #1e40af; color: white; padding: 12px; text-align: left; }
        .table td { padding: 12px; border-bottom: 1px solid #e5e7eb; }
        .table tr:nth-child(even) { background: #f8fafc; }
        .total-row { background: #dbeafe !important; font-weight: bold; }
        .amount { text-align: right; }
        .footer { margin-top: 30px; padding-top: 20px; border-top: 2px solid #e5e7eb; text-align: center; color: #6b7280; }
        .terms { background: #f1f5f9; padding: 15px; border-radius: 4px; margin-top: 20px; font-size: 13px; }
        .highlight { background: #fffbeb; padding: 10px; border-radius: 4px; margin: 15px 0; border-left: 4px solid #f59e0b; }
        .attachment { background: #f0f9ff; padding: 15px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #10b981; }
        /* ===============================
   RESPONSIVE EMAIL STYLES
   =============================== */

/* Mobile devices */
@media only screen and (max-width: 600px) {

    body {
        margin: 0 !important;
        padding: 0 !important;
    }

    .container {
        width: 100% !important;
        padding: 10px !important;
    }

    .header,
    .invoice-header {
        padding: 15px !important;
        text-align: center !important;
    }

    .header h1,
    .invoice-title {
        font-size: 20px !important;
    }

    .content,
    .invoice-body {
        padding: 15px !important;
    }

    /* Stack grid layout */
    .info-grid {
        display: block !important;
    }

    .info-item {
        width: 100% !important;
        margin-bottom: 10px !important;
    }

    /* Stack label/value */
    .detail-row {
        flex-direction: column !important;
        margin-bottom: 12px !important;
    }

    .label {
        width: 100% !important;
        margin-bottom: 4px !important;
        font-size: 13px !important;
    }

    .value {
        font-size: 14px !important;
    }

    /* Tables become scrollable */
    .table {
        display: block !important;
        width: 100% !important;
        overflow-x: auto !important;
        white-space: nowrap !important;
        font-size: 13px !important;
    }

    .table th,
    .table td {
        padding: 8px !important;
    }

    /* Reduce card padding */
    .section,
    .details,
    .attachment,
    .highlight,
    .terms {
        padding: 15px !important;
    }

    /* Footer text smaller */
    .footer {
        font-size: 12px !important;
        text-align: center !important;
    }

    /* Improve tap readability */
    p {
        font-size: 14px !important;
        line-height: 1.5 !important;
    }

    h3 {
        font-size: 16px !important;
    }
}

    </style>
</head>
<body>
    <div class="container">
        <div class="invoice-header">
            <h1 class="invoice-title">TAX INVOICE</h1>
            <p>Booking Invoice - PDF Attached</p>
        </div>

        <div class="invoice-body">
            <div class="attachment">
                <h3 style="color: #10b981; margin-top: 0;">📎 Invoice Attachment</h3>
                <p>Your detailed tax invoice is attached to this email as a PDF file.</p>
                <p style="font-size: 12px; color: #6b7280; margin-top: 8px;">
                    <strong>File:</strong> ${pdfInfo.filename}<br>
                    <strong>Please keep this invoice for your records and GST purposes.</strong>
                </p>
            </div>

            <div class="section">
                <div class="info-grid">
                    <div class="info-item">
                        <span class="label">Invoice Number:</span>
                        <span class="value">${invoiceNumber}</span>
                    </div>
                    <div class="info-item">
                        <span class="label">Invoice Date:</span>
                        <span class="value">${invoiceDate}</span>
                    </div>
                    <div class="info-item">
                        <span class="label">Booking Reference:</span>
                        <span class="value">${passenger.refId || "N/A"}</span>
                    </div>
                    <div class="info-item">
                        <span class="label">PNR:</span>
                        <span class="value">${pnr}</span>
                    </div>
                </div>
            </div>

            <div class="section">
                <h3 class="section-title">Passenger Details</h3>
                <div class="info-grid">
                    <div class="info-item">
                        <span class="label">Passenger Name:</span>
                        <span class="value">${passenger.title} ${passenger.firstName} ${passenger.lastName || ""}</span>
                    </div>
                    <div class="info-item">
                        <span class="label">Seat Number:</span>
                        <span class="value">${passenger.seat || "-"}</span>
                    </div>
                    <div class="info-item">
                        <span class="label">Email:</span>
                        <span class="value">${passenger.email}</span>
                    </div>
                    <div class="info-item">
                        <span class="label">Booking Status:</span>
                        <span class="value" style="color: #059669; font-weight: bold;">${passenger.status?.toUpperCase() || "CONFIRMED"}</span>
                    </div>
                </div>
            </div>

            <div class="section">
                <h3 class="section-title">Flight Details</h3>
                <div class="info-grid">
                    <div class="info-item">
                        <span class="label">Airline:</span>
                        <span class="value">${airlineName}</span>
                    </div>
                    <div class="info-item">
                        <span class="label">Route:</span>
                        <span class="value">${fromCity} → ${toCity}</span>
                    </div>
                    <div class="info-item">
                        <span class="label">Travel Date:</span>
                        <span class="value">${travelDate}</span>
                    </div>
                    <div class="info-item">
                        <span class="label">Passenger Type:</span>
                        <span class="value">${passenger.type?.toUpperCase() || "ADULT"}</span>
                    </div>
                </div>
            </div>

            <div class="section">
                <h3 class="section-title">Payment Summary</h3>
                <table class="table">
                    <thead>
                        <tr>
                            <th>Description</th>
                            <th>Quantity</th>
                            <th class="amount">Unit Price (₹)</th>
                            <th class="amount">Amount (₹)</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>Flight Ticket - ${passenger.type || "Adult"}</td>
                            <td>1</td>
                            <td class="amount">${passengerPrice.toLocaleString("en-IN")}</td>
                            <td class="amount">${passengerPrice.toLocaleString("en-IN")}</td>
                        </tr>
                        ${
                            infantPrice > 0
                                ? `
                        <tr>
                            <td>Infant Charge (${passenger.infant?.firstName || "Infant"})</td>
                            <td>1</td>
                            <td class="amount">${infantPrice.toLocaleString("en-IN")}</td>
                            <td class="amount">${infantPrice.toLocaleString("en-IN")}</td>
                        </tr>
                        `
                                : ""
                        }
                        <tr class="total-row">
                            <td colspan="3" style="text-align: right; font-size: 16px;"><strong>TOTAL AMOUNT:</strong></td>
                            <td class="amount" style="font-size: 18px;">₹${totalAmount.toLocaleString("en-IN")}</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div class="highlight">
                <p style="margin: 0; font-weight: bold;">Payment Status: <span style="color: #059669;">PAID</span></p>
                <p style="margin: 5px 0 0 0; font-size: 14px;">Payment received in full. This is a computer-generated invoice.</p>
            </div>

            <div class="terms">
                <p><strong>Terms & Conditions:</strong></p>
                <ul style="margin: 10px 0; padding-left: 20px;">
                    <li>This is a computer-generated invoice and does not require a physical signature.</li>
                    <li>All fares are inclusive of taxes unless specified otherwise.</li>
                    <li>Cancellation and refund policies apply as per airline rules.</li>
                    <li>Please carry this invoice along with valid ID proof during travel.</li>
                </ul>
            </div>

            <div class="footer">
                <p>Thank you for your business!</p>
                <p>For any queries regarding this invoice, please contact our accounts department.</p>
                <p><strong>${process.env.COMPANY_NAME || "Travel Agency"}</strong></p>
            </div>
        </div>
    </div>
</body>
</html>
        `

        const text = `
TAX INVOICE
===========

📎 INVOICE ATTACHMENT
Your detailed tax invoice is attached to this email as a PDF file (${pdfInfo.filename}).
Please keep this invoice for your records and GST purposes.

Invoice Number: ${invoiceNumber}
Invoice Date: ${invoiceDate}
Booking Reference: ${passenger.refId || "N/A"}
PNR: ${pnr}

PASSENGER DETAILS:
- Name: ${passenger.title} ${passenger.firstName} ${passenger.lastName || ""}
- Seat: ${passenger.seat || "-"}
- Email: ${passenger.email}
- Status: ${passenger.status?.toUpperCase() || "CONFIRMED"}

FLIGHT DETAILS:
- Airline: ${airlineName}
- Route: ${fromCity} → ${toCity}
- Travel Date: ${travelDate}
- Passenger Type: ${passenger.type?.toUpperCase() || "ADULT"}

PAYMENT SUMMARY:
===========================================
Description                 Qty  Unit Price  Amount
===========================================
Flight Ticket - ${passenger.type || "Adult"}  1    ₹${passengerPrice.toLocaleString("en-IN")}  ₹${passengerPrice.toLocaleString("en-IN")}
${infantPrice > 0 ? `Infant Charge  1    ₹${infantPrice.toLocaleString("en-IN")}  ₹${infantPrice.toLocaleString("en-IN")}` : ""}
===========================================
TOTAL AMOUNT: ₹${totalAmount.toLocaleString("en-IN")}
===========================================

Payment Status: PAID
Payment received in full.

This is a computer-generated invoice and does not require a physical signature.

Thank you for your business!
${process.env.COMPANY_NAME || "Travel Agency"}
        `

        const mailOptions = {
            from: `"${process.env.EMAIL_NAME || "Invoice Department"}" <${process.env.EMAIL_FROM}>`,
            to: passenger.email,
            subject: passenger.subject || `Tax Invoice - ${passenger.refId || passenger._id}`,
            text: text,
            html: html,
            attachments: [
                {
                    filename: pdfInfo.filename,
                    content: pdfInfo.buffer,
                    contentType: "application/pdf",
                },
            ],
        }

        const info = await transporter.sendMail(mailOptions)

        console.log(`✅ Invoice email sent with PDF: ${passenger.email}`, {
            messageId: info.messageId,
            subject: mailOptions.subject,
            invoiceNumber: invoiceNumber,
            amount: totalAmount,
            attachment: pdfInfo.filename,
        })

        return info
    } catch (error) {
        console.error("❌ Invoice email failed:", {
            passengerEmail: passenger.email,
            error: error.message,
            subject: passenger.subject,
        })
        throw error
    } finally {
        // Clean up temp file
        if (pdfInfo && pdfInfo.filepath) {
            await cleanupTempFiles([pdfInfo.filepath])
        }
    }
}

// Export the transporter for other uses
export { transporter }