import express from "express"
import { getETicketData, getInvoiceData } from "../controllers/ticket.controller.js"
import { accessController } from "../middlewares/accessController.middleware.js"

const router = express.Router()

// router.use(accessController("super-admin"))
// router.use(accessController("super-admin", "admin", "staff"))

router.get("/e-ticket/:passengerId", getETicketData)
// router.get("/e-ticket/:passengerId", )
// // GET invoice by passengerId
router.get("/:passengerId", getInvoiceData)

export default router
