import VendorEmailSetting from "../models/vendorEmailSetting.model.js";

/* ================= GET SETTINGS ================= */
export const getVendorEmailSetting = async (req, res) => {
  try {
    const { vendorId } = req.params;

    const setting = await VendorEmailSetting.findOne({ vendor: vendorId });

    res.json({
      success: true,
      setting: setting || null,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch email settings",
      error: error.message,
    });
  }
};

/* ================= CREATE / UPDATE ================= */
export const upsertVendorEmailSetting = async (req, res) => {
  try {
    const { vendorId } = req.params;

    const setting = await VendorEmailSetting.findOneAndUpdate(
      { vendor: vendorId },
      { ...req.body, vendor: vendorId },
      { new: true, upsert: true }
    );

    res.json({
      success: true,
      message: "Email settings saved successfully",
      setting,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to save email settings",
      error: error.message,
    });
  }
};
