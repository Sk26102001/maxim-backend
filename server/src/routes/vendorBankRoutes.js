import express from "express";
import { multerUpload } from "../utils/multer.js";
import {
  getBanks,
  getBank,
  createBank,
  updateBank,
  deleteBank,
  updateBankStatus,
} from "../controllers/vendorBankController.js";

const router = express.Router();

// GET all banks and POST new bank
router
  .route("/")
  .get(getBanks)
  .post(multerUpload.single("qrImage"),createBank);

// GET, PUT, DELETE single bank
router
  .route("/:id")
  .get(getBank)
  .put(multerUpload.single("qrImage"),updateBank)
  .delete(deleteBank);

// PATCH update bank status
router.patch("/:id/status", updateBankStatus);

export default router;