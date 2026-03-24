import express from "express";
import {
  createFinance,
  getFinanceByType,
  deleteFinance,
  updateFinance,
  getMonthlySummary,
} from "../../controllers/vendor/finance.controller.js";
// import { vendorAuth } from "../../middlewares/VendorAccessMiddleware.js";

const router = express.Router();

// router.use(vendorAuth());

// Create
router.post("/", createFinance);

// Get by type
router.get("/:type", getFinanceByType);

// Monthly Graph
router.get("/summary/:type", getMonthlySummary);

// Update
router.put("/:id", updateFinance);

// Delete
router.delete("/:id", deleteFinance);

export default router;