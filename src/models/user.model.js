import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import { Schema, model } from "mongoose"

const userSchema = new Schema(
    {
        role: {
            type: String,
            required: true,
            default: "super-admin",
            enum: ["super-admin", "admin", "staff"],
        },
        show: {
            type: Boolean,
            default: true,
        },
        userId: { type: String, required: true, trim: true },
        firstName: {
            type: String,
            required: true,
            trim: true,
        },
        lastName: {
            type: String,
            required: true,
            trim: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
        },
        mobile: {
            type: String,
            required: true,
            unique: true,
        },
        password: {
            type: String,
            required: true,
            minlength: [8, "Password should be at least 8 characters long"],
        },
        loginId: {
            type: String,
            required: true,
            unique: true,
            minlength: 8,
            maxlength: 12,
        },
        modules: {
            type: [String],
            default: [],
        },
        fullName: { type: String },
    },
    { timestamps: true }
)

userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next()
    this.password = await bcrypt.hash(this.password, 10)
    next()
})

userSchema.pre("save", async function (next) {
    this.fullName = `${this.firstName} ${this.lastName}`
    next()
})
userSchema.pre("findOneAndUpdate", function (next) {
    const update = this.getUpdate()
    if (update.firstName || update.lastName) {
        update.fullName = `${update.firstName || ""} ${update.lastName || ""}`.trim()
        this.setUpdate(update)
    }
    next()
})

userSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password)
}
userSchema.methods.generateAuthToken = function () {
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
        },
        process.env.JWT_SECRET
    )
}

const User = model("User", userSchema)
export default User
