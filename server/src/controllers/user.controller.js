import AdminSiteSetting from "../models/adminSiteSetting.js";
import User from "../models/user.model.js"
import UserCounter from "../models/userCounter.model.js"
import ApiError from "../utils/ApiError.js"

async function getNextFareId() {
    const counter = await UserCounter.findOneAndUpdate({ name: "userId" }, { $inc: { seq: 1 } }, { new: true, upsert: true })

    const paddedNumber = String(counter.seq)
    return `AMT${paddedNumber}`
}

export const login = async (req, res) => {
    try {
        let user
        user = await User.findOne({
            $or: [{ email: req.body.auth }, { loginId: req.body.auth }],
        })
        // if (!user) throw new ApiError(404, "Invalid Credentials")
        // const isPasswordCorrect = await user.isPasswordCorrect(req.body.password)
        // if (!isPasswordCorrect) throw new ApiError(404, "Invalid Credentials")

        if (!user) throw new ApiError(404, "Invalid Credentials")

// ❌ Block login if user is inactive
if (user.show === false) {
    throw new ApiError(403, "Your account is inactive. Please contact admin.")
}

const isPasswordCorrect = await user.isPasswordCorrect(req.body.password)
if (!isPasswordCorrect) throw new ApiError(404, "Invalid Credentials")


        const authToken = user.generateAuthToken()
        return res.status(200).json({ message: "User logged in successfully", authToken })
    } catch (error) {
        return res.status(error.status || 500).json({ message: error.message || "Internal server error" })
    }
}
export const register = async (req, res) => {
    try {
        if (req.body.password !== req.body.confirmPassword) {
            throw new ApiError(400, "Passwords do not match")
        }

        if (req.body.password.length < 8) {
            throw new ApiError(400, "Password must be at least 8 characters long")
        }
        const existingStaff = await User.findOne({
            $or: [{ email: req.body.email }, { loginId: req.body.loginId }],
        })
        if (existingStaff) {
            throw new ApiError(400, "User already exists")
        }
        const userId = await getNextFareId()
        await User.create({ ...req.body, userId })
        return res.status(201).json({ message: "User registered successfully" })
    } catch (error) {
        return res.status(error.status || 500).json({ message: error.message || "Internal server error" })
    }
}

// export const getCurrentUser = (req, res) => {
//     return res.status(200).json({ message: "User fetched successfully", user: req.user })
// }
export const getCurrentUser = async (req, res) => {
  try {
    const user = req.user;
    
    console.log("Current user ID:", user._id);
    console.log("User object:", JSON.stringify(user, null, 2));
    
    // Try to find site setting for this vendor
    const siteSetting = await AdminSiteSetting.findOne({ 
      vendor: user._id 
    });
    
    console.log("Found site setting:", siteSetting ? "Yes" : "No");
    if (siteSetting) {
      console.log("Site setting details:", JSON.stringify(siteSetting, null, 2));
    } else {
      // Check if any site settings exist at all
      const allSettings = await AdminSiteSetting.find({});
      console.log("Total site settings in DB:", allSettings.length);
      console.log("All site settings:", JSON.stringify(allSettings, null, 2));
    }

    return res.status(200).json({
      message: "User fetched successfully",
      user: {
        _id: user._id,
        userId: user.userId,
        name: user.name,
        email: user.email,
        loginId: user.loginId,
        role: user.role,
        show: user.show,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      },
      siteSetting: siteSetting || null
    });

  } catch (error) {
    console.error("Error in getCurrentUser:", error);
    return res.status(500).json({
      message: error.message || "Internal server error"
    });
  }
};

// export const getAllUsers = async (req, res) => {
//     try {
//         const users = await User.find({ show: true })
//         return res.status(200).json({ message: "Users fetched successfully", users })
//     } catch (error) {
//         return res.status(error.status || 500).json({ message: error.message || "Internal server error" })
//     }
// }
export const getAllUsers = async (req, res) => {
    try {
        const users = await User.find() // show BOTH active & inactive
        return res.status(200).json({ message: "Users fetched successfully", users })
    } catch (error) {
        return res
            .status(error.status || 500)
            .json({ message: error.message || "Internal server error" })
    }
}


export const getUserById = async (req, res) => {
    try {
        const { id } = req.params
        const user = await User.findById(id)
        if (!user) throw new ApiError(404, "User not found")
        return res.status(200).json({ message: "User fetched successfully", user })
    } catch (error) {
        return res.status(error.status || 500).json({ message: error.message || "Internal server error" })
    }
}

export const updateUser = async (req, res) => {
    try {
        const { id } = req.params
        const user = await User.findById(id)
        if (!user) throw new ApiError(404, "User not found")
        const updatedUser = await User.findByIdAndUpdate(id, req.body, { new: true })
        return res.status(200).json({ message: "User updated successfully", user: updatedUser })
    } catch (error) {
        return res.status(error.status || 500).json({ message: error.message || "Internal server error" })
    }
}
export const deleteUser = async (req, res) => {
    try {
        const { id } = req.params
        const user = await User.findById(id)
        if (!user) throw new ApiError(404, "User not found")
        await User.findByIdAndDelete(id)
        return res.status(200).json({ message: "User deleted successfully" })
    } catch (error) {
        return res.status(error.status || 500).json({ message: error.message || "Internal server error" })
    }
}

export const changePassword = async (req, res) => {
    try {
        const { id } = req.params
        const { currentPassword, newPassword, confirmPassword } = req.body
        if (newPassword !== confirmPassword) {
            return res.status(400).json({ message: "Passwords do not match" })
        }
        const user = await User.findById(id)
        if (!user) throw new ApiError(404, "Invalid User")
        const isPasswordCorrect = await user.isPasswordCorrect(currentPassword)
        if (!isPasswordCorrect) throw new ApiError(400, "Current password does not match")
        user.password = newPassword
        await user.save()
        return res.status(200).json({ message: "Password changed successfully" })
    } catch (error) {
        return res.status(error.status || 500).json({ message: error.message || "Internal server error" })
    }
}

export const changeMyPassword = async (req, res) => {
    try {
        const { currentPassword, newPassword, confirmPassword } = req.body
        if (newPassword !== confirmPassword) {
            return res.status(400).json({ message: "Passwords do not match" })
        }
        const user = await User.findById(req.user._id)
        const isPasswordCorrect = await user.isPasswordCorrect(currentPassword)
        if (!isPasswordCorrect) throw new ApiError(400, "Current password does not match")
        user.password = newPassword
        await user.save()
        return res.status(200).json({ message: "Password changed successfully" })
    } catch (error) {
        return res.status(error.status || 500).json({ message: error.message || "Internal server error" })
    }
}


// toggle active inactive
// 
export const toggleUserStatus = async (req, res) => {
    try {
        const { id } = req.params
        const { show } = req.body

        const user = await User.findById(id)
        if (!user) throw new ApiError(404, "User not found")

        user.show = show
        await user.save()

        return res.status(200).json({
            message: `User ${show ? "activated" : "inactivated"} successfully`,
            user,
        })
    } catch (error) {
        return res
            .status(error.status || 500)
            .json({ message: error.message || "Internal server error" })
    }
}
