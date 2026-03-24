import mongoose from "mongoose";

const financeSchema = new mongoose.Schema(
  {
    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vendor",
      required: true,
    },

    type: {
      type: String,
      enum: ["revenue", "expense", "purchase"],
      required: true,
    },

    amount: {
      type: Number,
      required: true,
    },

    remark: {
      type: String,
      trim: true,
    },

    date: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Finance", financeSchema);