import { Router } from "express"
import { addAirline, deleteAirline, getAllAirline, getSingleAirline, updateAirline } from "../controllers/airline.controller.js"
import { accessController } from "../middlewares/accessController.middleware.js"
import { multerUpload } from "../utils/multer.js"

const airlineRoutes = Router()


airlineRoutes.route("/").get(getAllAirline)
// airlineRoutes.use(accessController("super-admin "))
airlineRoutes.use(accessController("super-admin", "admin", "staff"))

// Add + List
airlineRoutes.route("/").post(multerUpload.single("logo"), addAirline)

// Get single (EDIT PAGE)
airlineRoutes.get("/:id", getSingleAirline)

// Update + Delete
airlineRoutes.route("/:id").put(multerUpload.single("logo"), updateAirline).delete(deleteAirline)

export default airlineRoutes
