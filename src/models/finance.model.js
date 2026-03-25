import mongoose from "mongoose";

const financeSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
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

export default mongoose.model("Finance_Admin", financeSchema);