import mongoose from "mongoose";

import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const vendorSchema = new mongoose.Schema(
  {
    companyName: {
      type: String,
      required: true,
      trim: true,
    },

    companyPhone: String,

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },

    password: {
      type: String,
      required: true,
    },

    loginId: {
      type: String,
      required: true,
      unique: true,
    },

    loginPin: {
      type: String,
      required: true,
    },

    prefix: {
      type: String,
      required: true,
    },

    pan: String,

    renewalDate: Date,

    renewalAmount: Number,

    /* Contact Info */
    contactName: String,
    address: String,
    city: String,
    state: String,
    country: String,
    pincode: String,

     role: {
      type: String,
      default: "vendor",
    },

    status: {
  type: String,
  enum: ["active", "inactive"],
  default: "active",

  
},


  },
  { timestamps: true }
);


// Compare Password
vendorSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

// Generate JWT Token
vendorSchema.methods.generateAuthToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      role: this.role,
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};



export default mongoose.model("Vendor", vendorSchema);
