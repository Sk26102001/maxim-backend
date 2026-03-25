import express from "express";
import {
  createVendor,
  getVendors,
  getVendor,
  updateVendor,
  deleteVendor,
  toggleVendorStatus,
  changeVendorPassword,
  vendorLogin,
  getCurrentVendor,
  directVendorLogin,
} from "../controllers/vendor.controller.js";
import { vendorAuth } from "../middlewares/VendorAccessMiddleware.js";

import { accessController } from "../middlewares/accessController.middleware.js"

const router = express.Router();

// Public route
router.post("/login", vendorLogin);

// Admin CRUD routes
router.post("/", createVendor);
router.get("/", getVendors);

// ✅ Static route BEFORE dynamic :id route
router.get("/current-vendor", 
  vendorAuth(),
   getCurrentVendor);

// Dynamic routes after static routes
router.get("/:id", getVendor);
router.put("/:id", updateVendor);
router.delete("/:id", deleteVendor);

router.patch("/:id/toggle-status", toggleVendorStatus);
router.patch("/:id/change-password", changeVendorPassword);

// Admin direct login as vendor
router.post("/direct-login/:id", 
  // vendorAuth(),
  accessController("super-admin",),
   directVendorLogin);

export default router;


// import express from "express";
// import {
//   createVendor,
//   getVendors,
//   getVendor,
//   updateVendor,
//   deleteVendor,
//   toggleVendorStatus,
//   changeVendorPassword,
//   vendorLogin,
//   getCurrentVendor,
// } from "../controllers/vendor.controller.js";
// import { vendorAuth } from "../middlewares/VendorAccessMiddleware.js"

// const router = express.Router();


// // router.use(accessController("super-admin", "vendor"))


// // router.post("/login", vendorLogin);
// // /* CRUD ROUTES */
// // router.post("/", createVendor);
// // router.get("/", getVendors);
// // router.get("/current-vendor", vendorAuth(),getCurrentVendor);
// // router.get("/:id", getVendor);
// // router.put("/:id", updateVendor);
// // router.delete("/:id", deleteVendor);



// // router.patch("/:id/toggle-status", toggleVendorStatus);

// // router.patch("/:id/change-password", changeVendorPassword);

// router.post("/login", vendorLogin);
// router.post("/", createVendor);
// router.get("/", getVendors);

// // Important: static route first
// router.get("/current-vendor", vendorAuth(), getCurrentVendor);

// // Dynamic route after static routes
// router.get("/:id", getVendor);
// router.put("/:id", updateVendor);
// router.delete("/:id", deleteVendor);

// router.patch("/:id/toggle-status", toggleVendorStatus);
// router.patch("/:id/change-password", changeVendorPassword);




// export default router;
