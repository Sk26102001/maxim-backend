import jwt from "jsonwebtoken"
import User from "../models/user.model.js"
import ApiError from "../utils/ApiError.js"

export const accessController = (...allowedRoles) => {
    return async (req, res, next) => {
        try {
            const authHeader = req.headers.authorization

            if (!authHeader || !authHeader.startsWith("Bearer ")) {
                throw new ApiError(401, "Login required")
            }

            const token = authHeader.split(" ")[1]
            if (!token || token === "null" || token === "undefined") {
                throw new ApiError(401, "Login required")
            }
            const decoded = jwt.verify(token, process.env.JWT_SECRET)
            const user = await User.findById(decoded._id).select("-password")
            if (!user) throw new ApiError(401, "Invalid Credentials")

            if (!allowedRoles.includes(user.role)) {
                return next(new ApiError(403, "You don't have permission."))
            }
            req.user = user
            next()
        } catch (error) {
            console.error("JWT Error:", error.message)
            return res.status(error.status || 401).json({
                status: error.status || 401,
                message: error.message || "Invalid or expired token",
            })
        }
    }
}
