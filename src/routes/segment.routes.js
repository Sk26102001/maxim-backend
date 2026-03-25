import { Router } from "express"
import { addSegment, deleteManySegments, deleteSegment, getAllSegment, getSegmentById, updateSegment } from "../controllers/segment.controller.js"
import { accessController } from "../middlewares/accessController.middleware.js"
const segmentRoutes = Router()

// segmentRoutes.use(accessController("super-admin"))
segmentRoutes.use(accessController("super-admin", "admin", "staff"))

segmentRoutes.route("/").post(addSegment).get(getAllSegment)
segmentRoutes.route("/delete-many").delete(deleteManySegments)
segmentRoutes.route("/:id").delete(deleteSegment).get(getSegmentById).put(updateSegment)

// convert AKMT to AMT in existing segments
// commneted for now to avoid accidental calls
// segmentRoutes.post("/migrate-fareid", migrateFareIdsAKMTtoAMT)

export default segmentRoutes
