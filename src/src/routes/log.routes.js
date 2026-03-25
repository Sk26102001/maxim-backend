import express from "express"
import { createLog, getAllInventoryLogs, getLogById } from "../controllers/log.controller.js"
import { accessController } from "../middlewares/accessController.middleware.js"

const router = express.Router()

router.post("/create", createLog)
router.get("/inventory-logs/:logId", getLogById)
// router.use(accessController("super-admin"))
router.use(accessController("super-admin", "admin", "staff"))


router.get("/all/inventory-logs", getAllInventoryLogs)

export default router
