import mongoose from "mongoose";

const vendorSiteSettingSchema = new mongoose.Schema(
  {
    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vendor",
      required: true,
      unique: true,
    },

    /* Address */
    address: String,
    city: String,
    state: String,
    country: String,
    pincode: String,

    /* Contact */
    phone: String,
    email: String,

    /* Meta */
    title: String,
    description: String,
    keyword: String,

    /* Assets */
    logo: String,
    favicon: String,
  },
  { timestamps: true }
);

export default mongoose.model("VendorSiteSetting", vendorSiteSettingSchema);
