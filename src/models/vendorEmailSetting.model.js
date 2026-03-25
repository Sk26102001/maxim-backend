import mongoose from "mongoose";

const vendorEmailSettingSchema = new mongoose.Schema(
  {
    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vendor",
      required: true,
      unique: true, // one setting per vendor
    },

    user: String,
    password: String,
    emailFrom: String,
    emailName: String,

    provider: {
      type: String,
      enum: ["zoho", "gmail", "outlook", "custom"],
      default: "zoho",
    },
  },
  { timestamps: true }
);

export default mongoose.model("VendorEmailSetting", vendorEmailSettingSchema);
