import Vendor from "../models/vendor.model.js";
import bcrypt from "bcryptjs";

import ApiError from "../utils/ApiError.js";
import VendorSiteSetting from "../models/vendorSiteSetting.model.js";

/* ================= CREATE VENDOR ================= */
export const createVendor = async (req, res) => {
  try {
    const data = req.body;

    // hash password & pin
    const salt = await bcrypt.genSalt(10);
    data.password = await bcrypt.hash(data.password, salt);
    data.loginPin = await bcrypt.hash(data.loginPin, salt);

    const vendor = await Vendor.create(data);

    res.status(201).json({
      success: true,
      message: "Vendor created successfully",
      vendor,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to create vendor",
      error: error.message,
    });
  }
};

/* ================= GET ALL VENDORS ================= */
export const getVendors = async (req, res) => {
  try {
    const vendors = await Vendor.find().sort({ createdAt: -1 });

    res.json({ success: true, vendors });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch vendors",
      error: error.message,
    });
  }
};

/* ================= GET SINGLE VENDOR ================= */
export const getVendor = async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.params.id);

    if (!vendor) {
      return res.status(404).json({ success: false, message: "Vendor not found" });
    }

    res.json({ success: true, vendor });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching vendor",
      error: error.message,
    });
  }
};

/* ================= UPDATE VENDOR ================= */
export const updateVendor = async (req, res) => {
  try {
    const vendor = await Vendor.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    if (!vendor) {
      return res.status(404).json({ success: false, message: "Vendor not found" });
    }

    res.json({ success: true, message: "Vendor updated", vendor });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update vendor",
      error: error.message,
    });
  }
};

/* ================= DELETE VENDOR ================= */
export const deleteVendor = async (req, res) => {
  try {
    const vendor = await Vendor.findByIdAndDelete(req.params.id);

    if (!vendor) {
      return res.status(404).json({ success: false, message: "Vendor not found" });
    }

    res.json({ success: true, message: "Vendor deleted" });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete vendor",
      error: error.message,
    });
  }
};


// 
/* ================= TOGGLE VENDOR STATUS ================= */
export const toggleVendorStatus = async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.params.id);

    if (!vendor) {
      return res.status(404).json({ success: false, message: "Vendor not found" });
    }

    vendor.status = vendor.status === "active" ? "inactive" : "active";

    await vendor.save();

    res.json({
      success: true,
      message: `Vendor ${vendor.status === "active" ? "activated" : "deactivated"} successfully`,
      vendor,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to toggle vendor status",
      error: error.message,
    });
  }
};


// 
/* ================= CHANGE VENDOR PASSWORD ================= */
export const changeVendorPassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;

    if (!newPassword) {
      return res.status(400).json({
        success: false,
        message: "New password is required",
      });
    }

    const vendor = await Vendor.findById(id);

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: "Vendor not found",
      });
    }

    // hash new password
    const salt = await bcrypt.genSalt(10);
    vendor.password = await bcrypt.hash(newPassword, salt);

    await vendor.save();

    res.json({
      success: true,
      message: "Password updated successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to change password",
      error: error.message,
    });
  }
};


/* ================= VENDOR LOGIN ================= */
// export const vendorLogin = async (req, res) => {
//   try {
//     const { auth, password } = req.body;

//     const vendor = await Vendor.findOne({
//       $or: [{ email: auth }, { loginId: auth }],
//     });

//     if (!vendor) throw new ApiError(404, "Invalid Credentials");

//     // Block inactive vendor
//     if (vendor.status === "inactive") {
//       throw new ApiError(
//         403,
//         "Your vendor account is inactive. Please contact admin."
//       );
//     }

//     const isPasswordCorrect = await vendor.isPasswordCorrect(password);
//     if (!isPasswordCorrect)
//       throw new ApiError(404, "Invalid Credentials");

//     const authToken = vendor.generateAuthToken();

//     return res.status(200).json({
//       message: "Vendor logged in successfully",
//       authToken,
//       vendor,
//     });
//   } catch (error) {
//     return res
//       .status(error.status || 500)
//       .json({ message: error.message || "Internal server error" });
//   }
// };
export const vendorLogin = async (req, res) => {
  try {
    const { auth, password } = req.body;

    const vendor = await Vendor.findOne({
      $or: [{ email: auth }, { loginId: auth }],
    });

    if (!vendor) throw new ApiError(404, "Invalid Credentials");

    if (vendor.status === "inactive") {
      throw new ApiError(
        403,
        "Your vendor account is inactive. Please contact admin."
      );
    }

    const isPasswordCorrect = await vendor.isPasswordCorrect(password);
    if (!isPasswordCorrect)
      throw new ApiError(404, "Invalid Credentials");

    const authToken = vendor.generateAuthToken();

    // ✅ Fetch site setting
    const siteSetting = await VendorSiteSetting.findOne({
      vendor: vendor._id,
    });

    // ✅ Convert vendor to object and attach siteSetting
    const vendorData = vendor.toObject();
    delete vendorData.password;
    delete vendorData.loginPin;

    vendorData.siteSetting = siteSetting || null;

    return res.status(200).json({
      message: "Vendor logged in successfully",
      authToken,
      vendor: vendorData,   // structure unchanged
    });
  } catch (error) {
    return res
      .status(error.status || 500)
      .json({ message: error.message || "Internal server error" });
  }
};


/* ================= GET CURRENT VENDOR ================= */
// export const getCurrentVendor = async (req, res) => {
//   try {
//     const { password, loginPin, ...vendorData } = req.user.toObject();
//     res.json({ success: true, vendor: vendorData });
//   } catch (error) {
//     res.status(500).json({ success: false, message: "Failed to fetch current vendor", error: error.message });
//   }
// };
export const getCurrentVendor = async (req, res) => {
  try {
    const { password, loginPin, ...vendorData } = req.user.toObject();

    // ✅ Fetch site setting (optional add-on)
    const siteSetting = await VendorSiteSetting.findOne({
      vendor: req.user._id,
    });

    // ✅ Add without touching old structure
    res.json({
      success: true,
      vendor: {
        ...vendorData,
        siteSetting: siteSetting || null,  // ← only addition
      },
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch current vendor",
      error: error.message,
    });
  }
};


// 
/* ================= DIRECT VENDOR LOGIN (ADMIN IMPERSONATION) ================= */
export const directVendorLogin = async (req, res) => {
  try {
    const { id } = req.params;

    const vendor = await Vendor.findById(id);

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: "Vendor not found",
      });
    }

    // Block inactive vendor - exactly like your login controller
    if (vendor.status === "inactive") {
      return res.status(403).json({
        success: false,
        message: "Your vendor account is inactive. Please contact admin.",
      });
    }

    // Generate JWT token using the same method as your login
    const authToken = vendor.generateAuthToken();

    // ✅ Fetch site setting
const siteSetting = await VendorSiteSetting.findOne({
  vendor: vendor._id,
});

    // Remove sensitive data before sending
    const vendorData = vendor.toObject();
    delete vendorData.password;
    delete vendorData.loginPin;

    vendorData.siteSetting = siteSetting || null;

    return res.status(200).json({
      success: true,
      message: "Vendor logged in successfully",
      authToken,
      vendor: vendorData
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to login as vendor",
      error: error.message,
    });
  }
};