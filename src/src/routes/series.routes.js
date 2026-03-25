import { Router } from "express"
import {
    addInventory,
    addSeries,
    deleteSeries,
    editInventory,
    editSeries,
    getAllInventories,
    getAllSeries,
    getCompletedInventoryDates,
    getInventoryById,
    getInventoryDateList,
    getInventoryDates,
    getSeriesById,
    getUpcomingInventoryDates,
    toggleSeriesStatus,
    updatePNRStatus,
} from "../controllers/series.controller.js"
import { accessController } from "../middlewares/accessController.middleware.js"

const seriesRouter = Router()

// seriesRouter.use(accessController("super-admin", "admin", "staff"))

seriesRouter.route("/").get(getAllSeries)
seriesRouter.route("/single/:id").get(getSeriesById)
seriesRouter.post("/add-segment", addSeries)
seriesRouter.get("/inventory/:id/dates", getInventoryDates)
seriesRouter.get("/inventory/upcoming-list", getUpcomingInventoryDates)
seriesRouter.get("/inventory/completed-list", getCompletedInventoryDates)
seriesRouter.get("/inventory-date-list", getInventoryDateList)
seriesRouter.post("/add-inventory", addInventory)

seriesRouter.get("/inventory-by-id/:id", getInventoryById)

seriesRouter.put("/edit/:id", editSeries)
// routes/series.routes.js
seriesRouter.put("/edit-inventory/:id", editInventory)

// In your backend routes (e.g., routes/inventory.js)
seriesRouter.put("/date/:inventoryDateId/pnr-status", updatePNRStatus)

// Add this new route for toggling series status
seriesRouter.patch("/toggle-status/:id", toggleSeriesStatus)

//  DELETE SERIES
seriesRouter.delete("/:id", deleteSeries)

// temp way to add new data
// seriesRouter.post("/admin/migrate-inventory-snapshots", migrateInventoryDateSnapshots)

// import { getAllInventories } from "../controllers/series.controller.js"

seriesRouter.get("/inventories", getAllInventories)

export default seriesRouter
