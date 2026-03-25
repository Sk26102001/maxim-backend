import { Router } from "express"
import {
    addAgent,
    allTransactions,
    changeAgentPassword,
    deductAmount,
    deleteAgent,
    depositAmount,
    getAgentById,
    getAllAgents,
    changeAgentStatus,
    runOverdueCheckManually,
} from "../controllers/agent.controller.js"
import { accessController } from "../middlewares/accessController.middleware.js"
import { multerUpload } from "../utils/multer.js"
const agentRouter = Router()

agentRouter.route("/").post(
    // accessController("super-admin"),
    accessController("super-admin", "admin", "staff"),
    multerUpload.fields([
        { name: "gstFile", maxCount: 1 },
        { name: "panFile", maxCount: 1 },
        { name: "aadharFile", maxCount: 1 },
    ]),
    addAgent
)

agentRouter
    .route("/")
    // get(accessController("super-admin"),
    .get(
        // accessController("super-admin", "admin", "staff"),
         getAllAgents)
// for payment reminder
agentRouter.post("/agents/run-overdue-check", runOverdueCheckManually)

agentRouter.post(
    "/deposit/:id",
    // accessController("super-admin"),
    accessController("super-admin", "admin", "staff"),
    depositAmount
)
agentRouter.post(
    "/deduct/:id",
    // accessController("super-admin"),
    // accessController("super-admin", "admin", "staff"),
    deductAmount
)
agentRouter.get(
    "/all-transactions/:id",
    //  accessController("super-admin"),
    accessController("super-admin", "admin", "staff"),
    allTransactions
)

// Route for changing agent status
agentRouter.patch(
    "/:id/status",
    accessController("super-admin", "admin", "staff"),
    changeAgentStatus
)

agentRouter
    .route("/:id")
    .get(
        // accessController("super-admin"),
        accessController("super-admin", "admin", "staff"),
        getAgentById
    )
    .patch(
        // accessController("super-admin"),
        accessController("super-admin", "admin", "staff"),
        changeAgentPassword
    )
    .delete(
        // accessController("super-admin"),
        accessController("super-admin", "admin", "staff"),
        deleteAgent
    )

// import { runOverdueCheckManually } from "../controllers/agentOverdue.controller.js"

export default agentRouter
