import cookieParser from "cookie-parser"
import cors from "cors"
import express from "express"
import helmet from "helmet"
import morgan from "morgan"
import path from "path"
import vendorRoutes from "../src/routes/vendor.routes.js";
import vendorEmailSettingRoutes from "./routes/vendorEmailSetting.routes.js";
import vendorSiteSettingRoutes from "./routes/vendorSiteSetting.routes.js";

const app = express()

// <<<<<<< HEAD
app.use(cors({ origin: ["http://localhost:5173","http://localhost:5174", "https://a-maximtrip.netlify.app","https://akapi.maximtrip.com", "https://maximtrip.edustylestore.com", "https://maximtrip.netlify.app","https://sk26102001.github.io"] }))
// =======
app.use(cors({ origin: ["http://localhost:5173","http://localhost:5174","https://a-maximtrip.netlify.app", "https://akapi.maximtrip.com", "https://maximtrip.edustylestore.com", "https://maximtrip.netlify.app","https://sk26102001.github.io"] }))
// >>>>>>> 52e6698c37957ff950bce0757b48768991a35157
// app.use(cors({ origin: ["http://localhost:5173", "https://akapi.maximtrip.com", "https://maximtrip.edustylestore.com"] }))
// app.use(helmet())
app.use(
    helmet({
        crossOriginResourcePolicy: { policy: "cross-origin" },
    })
)

app.use(morgan("dev"))
app.use(express.json({ limit: "16kb" }))
app.use(express.urlencoded({ extended: true }))
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")))
app.use(cookieParser())

app.disable("etag")

import agentRoutes from "./routes/agent.routes.js"
import airlineRoutes from "./routes/airline.routes.js"
import airportRoutes from "./routes/airport.routes.js"
import baseRouter from "./routes/base.routes.js"
import emailSettingRoutes from "./routes/emailSettingRoutes.js"
import passengerRouter from "./routes/inventory.passenger.routes.js"
import logRoutes from "./routes/log.routes.js"
import segmentRoutes from "./routes/segment.routes.js"
import seriesRouter from "./routes/series.routes.js"
import ticketRoutes from "./routes/ticket.routes.js"
import userRouter from "./routes/user.routes.js"
// for payment reminder
import "./cron/agentOverdue.cron.js"
import vendorBankRoutes from "./routes/vendorBankRoutes.js"

import vendorSameRoutes from "./routes/vendor/agent.routes.js"

import VendorSeriesRoutes from "./routes/vendor/series.routes.js"
import VendorSegmentRoutes from "./routes/vendor/segment.routes.js"
import VendorPassengerRoutes from "./routes/vendor/inventory.passenger.routes.js"
import VendorAgentRoutes from "./routes/vendor/agent.routes.js"
import VendorticketRoutes from "./routes/vendor/ticket.routes.js"
import VendorlogRoutes from "./routes/vendor/log.routes.js"
import VendorFinance from "./routes/vendor/finance.routes.js"
import AdminFinanceRoutes from "./routes/finance.routes.js"
import adminBankRoutes from "./routes/bank/vendorBankRoutes.js"
import AdminSiteSettingRoutes from "./routes/adminSiteSetting.js"


app.use("/", baseRouter)
app.use("/api/airlines", airlineRoutes)
app.use("/api/segments", segmentRoutes)
app.use("/api/passengers", passengerRouter)
app.use("/api/users", userRouter)
app.use("/api/airports", airportRoutes)
app.use("/api/agents", agentRoutes)
app.use("/api/series", seriesRouter)
app.use("/api/logs", logRoutes)
app.use("/api/vendors", vendorRoutes);
app.use("/api/finance", AdminFinanceRoutes);
app.use('/api/banks', adminBankRoutes);
app.use("/api/same/vendors/", vendorSameRoutes);
app.use("/api/maximtrip-site-setting", AdminSiteSettingRoutes);
// app.use("/api/same/v2/vendors/agents", VendorAgentRoutes)
app.use("/api/same/v2/vendors/series", VendorSeriesRoutes);
app.use("/api/same/v2/vendors/segment", VendorSegmentRoutes);
app.use("/api/same/v2/vendors/passengers", VendorPassengerRoutes);
app.use("/api/same/v2/vendors/tickets", VendorticketRoutes)
app.use("/api/same/v2/vendors/logs", VendorlogRoutes)
app.use("/api/same/v2/vendors/finance", VendorFinance)

app.use('/api/vendor/banks', vendorBankRoutes);

app.use("/api/vendor-email-settings", vendorEmailSettingRoutes);

app.use("/api/vendor-site-setting", vendorSiteSettingRoutes);


app.use("/api/tickets", ticketRoutes)

app.use("/api/email", emailSettingRoutes)

export { app }
