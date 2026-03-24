import jwt from "jsonwebtoken"
import Vendor from "../models/vendor.model.js"
import ApiError from "../utils/ApiError.js"

export const vendorAuth = (...allowedRoles) => {
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

            const vendor = await Vendor.findById(decoded._id).select("-password -loginPin")
            if (!vendor) throw new ApiError(401, "Invalid Credentials")

            if (allowedRoles.length && !allowedRoles.includes(vendor.role)) {
                throw new ApiError(403, "You don't have permission.")
            }

            req.user = vendor
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
