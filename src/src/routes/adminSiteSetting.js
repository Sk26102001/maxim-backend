import express from "express";
import {
  getVendorSiteSetting,
  updateVendorSiteSetting,
} from "../controllers/adminSiteSetting.js";

import { multerUpload } from "../utils/multer.js";

const router = express.Router();

router.get("/:vendorId", getVendorSiteSetting);
router.put("/:vendorId", multerUpload.fields([
    { name: "logoMaxim", maxCount: 1 },
    { name: "faviconMaxim", maxCount: 1 },
  ]), updateVendorSiteSetting);

export default router;
