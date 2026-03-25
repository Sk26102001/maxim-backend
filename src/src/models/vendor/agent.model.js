import bcrypt from "bcrypt"
import mongoose from "mongoose"

const agentSchema = new mongoose.Schema(
    {
        agentName: { type: String, required: true },
        companyMobile: { type: String, required: true },
        companyEmail: { type: String, required: true },
        password: { type: String },
        // loginID: { type: String, default: undefined },
        paymentTerms: { type: String, required: true },
        planClass: { type: String },
        supplier: { type: Boolean },
        creditLimitLock: { type: Boolean, default: false },
        creditLimit: { type: Number, default: 0 },

        gstHolderName: { type: String },
        gstNumber: { type: String },
        panNumber: { type: String },
        aadharNumber: { type: String },

        gstFilePath: { type: String },
        panFilePath: { type: String },
        aadharFilePath: { type: String },
        gstFile: { type: String },
        panFile: { type: String },
        aadharFile: { type: String },

        contactName: { type: String },
        contactDesignation: { type: String },
        contactEmail: { type: String },
        contactMobile: { type: String },
        address: { type: String },
        city: { type: String },
        state: { type: String },
        country: { type: String },
        pincode: { type: String },
        remark: { type: String },

        status: { type: String, enum: ["active", "inactive"], default: "active" },
        outstanding: { type: Number, default: 0 },

        //for payment reminder
        creditStartDate: { type: Date }, // when outstanding went negative
        lastOverdueEmailSent: { type: Date }, // to avoid duplicate same-day emails

        // unique code in AMT
        agentCode: {
            type: String,
            unique: true,
            index: true,
        },
    },
    { timestamps: true }
)

agentSchema.pre("save", async function (next) {
    if (!this.isNew || this.agentCode) return next()

    const Agent = mongoose.model("Agent_Vendor")
    let attempt = 0
    const MAX_RETRIES = 5

    while (attempt < MAX_RETRIES) {
        const lastAgent = await Agent.findOne({ agentCode: { $regex: /^AMT\d+$/ } })
            .sort({ createdAt: -1 })
            .select("agentCode")
            .lean()

        let nextNumber = 1

        if (lastAgent?.agentCode) {
            const lastNumber = parseInt(lastAgent.agentCode.replace("AMT", ""), 10)
            if (!isNaN(lastNumber)) nextNumber = lastNumber + 1
        }

        this.agentCode = `AMT${nextNumber}`

        // Check existence BEFORE save
        const exists = await Agent.exists({ agentCode: this.agentCode })
        if (!exists) break

        attempt++
    }

    if (attempt === MAX_RETRIES) {
        return next(new Error("Failed to generate unique agentCode"))
    }

    next()
})

// agentSchema.pre("save", async function (next) {
//     // Only generate for new documents
//     if (!this.isNew || this.agentCode) return next()

//     const lastAgent = await mongoose
//         .model("Agent")
//         .findOne({ agentCode: { $regex: /^AMT\d+$/ } })
//         .sort({ createdAt: -1 })
//         .select("agentCode")
//         .lean()

//     let nextNumber = 1

//     if (lastAgent?.agentCode) {
//         const lastNumber = parseInt(lastAgent.agentCode.split("-")[1], 10)
//         if (!isNaN(lastNumber)) {
//             nextNumber = lastNumber + 1
//         }
//     }

//     this.agentCode = `AMT${nextNumber}`
//     next()
// })

agentSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next()
    this.password = await bcrypt.hash(this.password, 10)
    next()
})
agentSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password)
}
const Agent = mongoose.model("Agent_Vendor", agentSchema)
export default Agent
