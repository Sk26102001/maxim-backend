import mongoose from "mongoose";

const bankSchema = new mongoose.Schema(
  {
    accountHolderName: {
      type: String,
      required: [true, "Account holder name is required"],
      trim: true,
    },
    bankName: {
      type: String,
      required: [true, "Bank name is required"],
      trim: true,
    },
    accountNumber: {
      type: String,
      required: [true, "Account number is required"],
      unique: true,
      trim: true,
    },
    branchName: {
      type: String,
      default: "-",
      trim: true,
    },
    ifscCode: {
      type: String,
      required: [true, "IFSC code is required"],
      trim: true,
      uppercase: true,
    },
    swiftCode: {
      type: String,
      default: "-",
      trim: true,
      uppercase: true,
    },
    category: {
      type: String,
      required: true,
      enum: ["B2b", "B2c"],
      default: "B2b",
    },
    status: {
      type: String,
      required: true,
      enum: ["Active", "Inactive"],
      default: "Active",
    },
    remarks: {
      type: String,
      default: "",
    },
    entryDate: {
      type: Date,
      default: Date.now,
    },
    renewableAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    qrImage: {
  type: String,
  default: "",
},
  },
  {
    timestamps: true,
  }
);

// Add index for better search performance
bankSchema.index({
  bankName: "text",
  accountNumber: "text",
  accountHolderName: "text",
});

const Bank = mongoose.model("Bank", bankSchema);

export default Bank;