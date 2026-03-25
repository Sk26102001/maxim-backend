import express from "express";
import { multerUpload } from "../../utils/multer.js";
import {
  getBanks,
  getBank,
  createBank,
  updateBank,
  deleteBank,
  updateBankStatus,
} from "../../controllers/bank/vendorBankController.js";

const router = express.Router();

// GET all banks and POST new bank
router
  .route("/")
  .get(getBanks)
  .post(multerUpload.single("qrImageAdmin"),createBank);

// GET, PUT, DELETE single bank
router
  .route("/:id")
  .get(getBank)
  .put(multerUpload.single("qrImageAdmin"),updateBank)
  .delete(deleteBank);

// PATCH update bank status
router.patch("/:id/status", updateBankStatus);

export default router;