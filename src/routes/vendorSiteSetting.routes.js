import express from "express";
import {
  getVendorSiteSetting,
  updateVendorSiteSetting,
} from "../controllers/vendorSiteSetting.controller.js";

import { multerUpload } from "../utils/multer.js";

const router = express.Router();

router.get("/:vendorId", getVendorSiteSetting);
router.put("/:vendorId", multerUpload.fields([
    { name: "logo", maxCount: 1 },
    { name: "favicon", maxCount: 1 },
  ]), updateVendorSiteSetting);

export default router;
