import AdminSiteSetting from "../models/adminSiteSetting.js";

/* ================= GET SITE SETTING ================= */
export const getVendorSiteSetting = async (req, res) => {
  try {
    const { vendorId } = req.params;

    let setting = await AdminSiteSetting.findOne({ vendor: vendorId });

    // if not exists → create empty
    if (!setting) {
      setting = await AdminSiteSetting.create({ vendor: vendorId });
    }

    res.json({ success: true, setting });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch site setting",
      error: error.message,
    });
  }
};

/* ================= UPDATE SITE SETTING ================= */
export const updateVendorSiteSetting = async (req, res) => {
  try {
    const { vendorId } = req.params;

    const data = { ...req.body };

    /* ===== Handle uploaded files - UPDATED FIELD NAMES ===== */
    if (req.files?.logoMaxim?.[0]) {
      data.logo = `/uploads/${req.files.logoMaxim[0].filename}`;
    }

    if (req.files?.faviconMaxim?.[0]) {
      data.favicon = `/uploads/${req.files.faviconMaxim[0].filename}`;
    }

    const setting = await AdminSiteSetting.findOneAndUpdate(
      { vendor: vendorId },
      data,
      { new: true, upsert: true }
    );

    res.json({
      success: true,
      message: "Site setting updated successfully",
      setting,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update site setting",
      error: error.message,
    });
  }
};

// import AdminSiteSetting from "../models/adminSiteSetting.js";

// /* ================= GET SITE SETTING ================= */
// export const getVendorSiteSetting = async (req, res) => {
//   try {
//     const { vendorId } = req.params;

//     let setting = await AdminSiteSetting.findOne({ vendor: vendorId });

//     // if not exists → create empty
//     if (!setting) {
//       setting = await AdminSiteSetting.create({ vendor: vendorId });
//     }

//     res.json({ success: true, setting });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: "Failed to fetch site setting",
//       error: error.message,
//     });
//   }
// };

// /* ================= UPDATE SITE SETTING ================= */
// // export const updateVendorSiteSetting = async (req, res) => {
// //   try {
// //     const { vendorId } = req.params;

// //     const setting = await VendorSiteSetting.findOneAndUpdate(
// //       { vendor: vendorId },
// //       req.body,
// //       { new: true, upsert: true }
// //     );

// //     res.json({
// //       success: true,
// //       message: "Site setting updated successfully",
// //       setting,
// //     });
// //   } catch (error) {
// //     res.status(500).json({
// //       success: false,
// //       message: "Failed to update site setting",
// //       error: error.message,
// //     });
// //   }
// // };
// export const updateVendorSiteSetting = async (req, res) => {
//   try {
//     const { vendorId } = req.params;

//     const data = { ...req.body };

//     /* ===== Handle uploaded files ===== */
//     if (req.files?.logo?.[0]) {
//       data.logo = `/uploads/${req.files.logo[0].filename}`;
//     }

//     if (req.files?.favicon?.[0]) {
//       data.favicon = `/uploads/${req.files.favicon[0].filename}`;
//     }

//     const setting = await AdminSiteSetting.findOneAndUpdate(
//       { vendor: vendorId },
//       data,
//       { new: true, upsert: true }
//     );

//     res.json({
//       success: true,
//       message: "Site setting updated successfully",
//       setting,
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: "Failed to update site setting",
//       error: error.message,
//     });
//   }
// };

