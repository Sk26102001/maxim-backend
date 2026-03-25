// routes/inventory.routes.js
import { Router } from "express"
// import { sendPassengerEmails } from "../controllers/inv_passenger.email.controller.js"
import {
    addOrUpdateInfant,
    addPassenger,
    getPassengersByInventoryDate,
    sendPassengerEmails,
    sendPassengerInvoiceEmails,
    updatePassenger,
} from "../controllers/inventory.passenger.controller.js"
import { accessController } from "../middlewares/accessController.middleware.js"

const router = Router()

// router.use(accessController("super-admin"))
// router.use(accessController("super-admin", "admin", "staff"))

router.post("/:inventoryId/date/:inventoryDateId/passengers", addPassenger)
router.get("/:inventoryId/date/:inventoryDateId/passengers", getPassengersByInventoryDate)
// routes/inventory.routes.js
router.put("/:inventoryId/date/:inventoryDateId/passengers/:passengerId", updatePassenger)
router.post("/email/send", sendPassengerEmails)
router.post("/email/send-invoice", sendPassengerInvoiceEmails) //  ADD THIS

router.post("/:inventoryId/date/:inventoryDateId/passengers/:passengerId/infant", addOrUpdateInfant)

// ✅ Temporary route to add booking IDs to all old passengers
// temp method to add booking id to old passengers
// router.post("/add-booking-id-to-old", addBookingIdToAllPassengers)

export default router
