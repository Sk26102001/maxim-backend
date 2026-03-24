import VendorSiteSetting from "../models/vendorSiteSetting.model.js";

/* ================= GET SITE SETTING ================= */
export const getVendorSiteSetting = async (req, res) => {
  try {
    const { vendorId } = req.params;

    let setting = await VendorSiteSetting.findOne({ vendor: vendorId });

    // if not exists → create empty
    if (!setting) {
      setting = await VendorSiteSetting.create({ vendor: vendorId });
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
// export const updateVendorSiteSetting = async (req, res) => {
//   try {
//     const { vendorId } = req.params;

//     const setting = await VendorSiteSetting.findOneAndUpdate(
//       { vendor: vendorId },
//       req.body,
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
export const updateVendorSiteSetting = async (req, res) => {
  try {
    const { vendorId } = req.params;

    const data = { ...req.body };

    /* ===== Handle uploaded files ===== */
    if (req.files?.logo?.[0]) {
      data.logo = `/uploads/${req.files.logo[0].filename}`;
    }

    if (req.files?.favicon?.[0]) {
      data.favicon = `/uploads/${req.files.favicon[0].filename}`;
    }

    const setting = await VendorSiteSetting.findOneAndUpdate(
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

