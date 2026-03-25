import express from "express"
import { getEmailSettings, updateEmailSettings } from "../controllers/emailSettingController.js"
import { accessController } from "../middlewares/accessController.middleware.js"

const router = express.Router()

// router.use(accessController("super-admin"))
router.use(accessController("super-admin", "admin", "staff"))

router.get("/email-settings", getEmailSettings)
router.put("/email-settings", updateEmailSettings)

export default router
