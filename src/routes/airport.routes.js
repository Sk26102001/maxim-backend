import { Router } from "express"
import { addAirport, deleteAirport, editAirport, getAirportById, getAllAirport } from "../controllers/airport.controller.js"
import { accessController } from "../middlewares/accessController.middleware.js"
const airportRoutes = Router()

airportRoutes.route("/:id").get(getAirportById)
// airportRoutes.use(accessController('super-admin'))
// airportRoutes.use(accessController("super-admin", "admin", "staff"))
airportRoutes.route("/:id").put(editAirport).delete(deleteAirport)
airportRoutes.route("/").post(addAirport).get(getAllAirport)
export default airportRoutes
