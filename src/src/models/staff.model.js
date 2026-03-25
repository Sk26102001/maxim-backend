import mongoose from 'mongoose'

const staffSchema = new mongoose.Schema(
    {
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
            minlength: 8,
        },
        loginId: {
            type: String,
            required: true,
            unique: true,
            minlength: 8,
            maxlength: 12,
        },
        // If you enable modules later
        modules: {
            type: [String],
            default: [],
        },
    },
    { timestamps: true },
)

staffSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next()
    this.password = await bcrypt.hash(this.password, 10)
    next()
})

staffSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password)
}
const Staff = mongoose.model('Staff', staffSchema)

export default Staff
