import express from "express";
import {
  getVendorEmailSetting,
  upsertVendorEmailSetting,
} from "../controllers/vendorEmailSetting.controller.js";

const router = express.Router();

/* vendor-wise email setting */
router.get("/:vendorId", getVendorEmailSetting);
router.put("/:vendorId", upsertVendorEmailSetting);

export default router;
