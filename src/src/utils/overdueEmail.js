import EmailSetting from "../models/EmailSetting.js" // adjust path
import { cleanupTempFiles, generateAccountStatementPDF } from "./pdfGenerator.js" // adjust path
import { transporter } from "./sendMail.js"

export const sendOverdueEmail = async ({ agent, overdueDays, dueDate }) => {
    let pdfFile = null
    try {
        // Generate the account statement PDF
        pdfFile = await generateAccountStatementPDF(agent._id)

        const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8" />
          <title>Payment Reminder</title>
        </head>
        <body style="margin:0;padding:0;background:#0f172a;font-family:Arial,Helvetica,sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td align="center" style="padding:20px;">
                <table width="600" cellpadding="0" cellspacing="0" style="background:#111827;color:#e5e7eb;border-radius:8px;box-shadow:0 0 10px rgba(0,0,0,.6);">
                  
                  <!-- HEADER -->
                  <tr>
                    <td style="padding:20px;border-bottom:1px dashed #374151;">
                      <h2 style="margin:0;color:#f9fafb;">Payment Reminder</h2>
                    </td>
                  </tr>

                  <!-- CONTENT -->
                  <tr>
                    <td style="padding:20px;">
                      <p style="margin:0 0 10px;">
                        Dear <strong style="color:#ffffff;">${agent.agentName} [${agent.agentCode}]</strong>
                      </p>

                      <p style="margin:0 0 15px;">
                        You might have missed the payment date and the outstanding amount is now overdue.
                      </p>

                      <hr style="border:none;border-top:1px dashed #374151;margin:15px 0;" />

                      <p style="font-size:16px;">
                        <strong>Total Balance:</strong>
                        <span style="color:#ef4444;font-weight:bold;">
                          Rs. ${agent.outstanding}
                        </span>
                        &nbsp;&nbsp; Account statement attached.
                      </p>

                      <hr style="border:none;border-top:1px dashed #374151;margin:15px 0;" />

                      <p>
                        View your attached Account Statement and take the easy way out by making an online payment.
                      </p>

                      <hr style="border:none;border-top:1px solid #ef4444;margin:20px 0;" />

                      <!-- BANK DETAILS -->
                      <h4 style="margin-bottom:10px;color:#ffffff;">BANK DETAILS</h4>

                      <table width="100%" cellpadding="8" cellspacing="0" style="border-collapse:collapse;font-size:14px;">
                        <tr style="background:#020617;color:#ffffff;">
                          <th align="left">BANK NAME</th>
                          <th align="left">BRANCH</th>
                          <th align="left">A/C NAME</th>
                          <th align="left">A/C NUMBER</th>
                          <th align="left">IFSC CODE</th>
                        </tr>
                        <tr style="color:#f87171;">
                          <td>HDFC BANK</td>
                          <td>H.S.H. STREET</td>
                          <td>MaximTrip</td>
                          <td>50200050392260</td>
                          <td>HDFC0000724</td>
                        </tr>
                      </table>

                      <p style="margin-top:15px;color:#f87171;">
                        <strong>Note:</strong> Kindly send payment receipts on
                        <a href="mailto:accounts@maximtrip.in" style="color:#f87171;text-decoration:none;">
                          accounts@maximtrip.in
                        </a>
                      </p>

                      <p style="margin-top:10px;">
                        If you have already paid, please accept our apologies and kindly ignore this payment reminder.
                      </p>

                      <p style="margin-top:20px;">
                        Regards,<br />
                        <strong>MAXIMTRIP Accounts</strong>
                      </p>
                    </td>
                  </tr>

                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
        `

        // Fetch email settings (example: latest or default one)
        const emailSetting = await EmailSetting.findOne({ provider: "zoho" }).lean()

        if (!emailSetting) {
            throw new Error("Email settings not found")
        }

        const fromAddress = `"${emailSetting.emailName}" <${emailSetting.emailFrom}>`

        // Send email with PDF attachment
        await transporter.sendMail({
            // from: `"Accounts" <${process.env.EMAIL_FROM}>`,
            from: fromAddress,

            to: agent.companyEmail,
            subject: `Payment of Rs : ${agent.outstanding} is Outstanding/MAXIMTRIP`,
            html,
            attachments: [
                {
                    filename: pdfFile.filename,
                    path: pdfFile.filepath,
                    contentType: "application/pdf",
                },
            ],
        })
    } finally {
        if (pdfFile) await cleanupTempFiles([pdfFile.filepath])
    }
}
