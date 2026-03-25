import { Router } from "express"
const router = Router()

router.route("/").get((req, res) => res.send("server started"))

export default router
