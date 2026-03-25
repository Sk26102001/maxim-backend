import mongoose from "mongoose"

const emailSettingSchema = new mongoose.Schema(
    {
        user: { type: String, required: true },
        password: { type: String, required: true },
        emailFrom: { type: String, required: true },
        emailName: { type: String, required: true },
        provider: {
            type: String,
            // enum: ["zoho", "gmail", "outlook", "custom"],
            default: "zoho",
        },
    },
    { timestamps: true }
)

export default mongoose.model("EmailSetting", emailSettingSchema)
