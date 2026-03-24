// controllers/finance.controller.js

import mongoose from "mongoose";
import Finance_Admin from "../models/finance.model.js";

// ✅ CREATE
export const createFinance = async (req, res) => {
  try {
    const { type, amount, remark, date, user } = req.body;

    if (!user) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const finance = await Finance_Admin.create({
      user, // ✅ directly store user ID
      type,
      amount,
      remark,
      date,
    });

    res.status(201).json(finance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ GET ALL BY TYPE
export const getFinanceByType = async (req, res) => {
  try {
    const { type } = req.params;
    const { user } = req.query;

    if (!user) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const data = await Finance_Admin.find({
      user,
      type,
    }).sort({ date: -1 });

    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ DELETE
export const deleteFinance = async (req, res) => {
  try {
    const { user } = req.body;

    const finance = await Finance_Admin.findOneAndDelete({
      _id: req.params.id,
      user,
    });

    if (!finance) {
      return res.status(404).json({ message: "Not found" });
    }

    res.json({ message: "Deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ UPDATE
export const updateFinance = async (req, res) => {
  try {
    const { user } = req.body;

    const finance = await Finance_Admin.findOneAndUpdate(
      { _id: req.params.id, user },
      req.body,
      { new: true }
    );

    if (!finance) {
      return res.status(404).json({ message: "Not found" });
    }

    res.json(finance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ MONTHLY GRAPH DATA
export const getMonthlySummary = async (req, res) => {
  try {
    const { type } = req.params;
    const { user } = req.query;

    if (!user) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const summary = await Finance_Admin.aggregate([
      {
        $match: {
          user: new mongoose.Types.ObjectId(user),
          type,
        },
      },
      {
        $group: {
          _id: { $month: "$date" },
          total: { $sum: "$amount" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.json(summary);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// // controllers/vendor/finance.controller.js
// import mongoose from "mongoose";
// import Finance_Admin from "../models/finance.model.js";

// // ✅ CREATE
// export const createFinance = async (req, res) => {
//   try {
//     const { type, amount, remark, date, vendor } = req.body; // Get vendor from body

//     // Validate vendor ID
//     if (!vendor) {
//       return res.status(400).json({ message: "Vendor ID is required" });
//     }

//     const finance = await Finance_Admin.create({
//       vendor: vendor, // Use vendor from request body
//       type,
//       amount,
//       remark,
//       date,
//     });

//     res.status(201).json(finance);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// // ✅ GET ALL BY TYPE
// export const getFinanceByType = async (req, res) => {
//   try {
//     const { type } = req.params;
//     const { vendorId } = req.query; // Get vendorId from query params

//     if (!vendorId) {
//       return res.status(400).json({ message: "Vendor ID is required" });
//     }

//     const data = await Finance_Admin.find({
//       vendor: vendorId,
//       type,
//     }).sort({ date: -1 });

//     res.json(data);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// // ✅ DELETE
// export const deleteFinance = async (req, res) => {
//   try {
//     const { vendorId } = req.body; // Get vendorId from body

//     const finance = await Finance_Admin.findOneAndDelete({
//       _id: req.params.id,
//       vendor: vendorId,
//     });

//     if (!finance) {
//       return res.status(404).json({ message: "Not found" });
//     }

//     res.json({ message: "Deleted successfully" });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// // ✅ UPDATE
// export const updateFinance = async (req, res) => {
//   try {
//     const { vendorId } = req.body; // Get vendorId from body

//     const finance = await Finance_Admin.findOneAndUpdate(
//       { _id: req.params.id, vendor: vendorId },
//       req.body,
//       { new: true }
//     );

//     if (!finance) {
//       return res.status(404).json({ message: "Not found" });
//     }

//     res.json(finance);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// // ✅ MONTHLY GRAPH DATA
// export const getMonthlySummary = async (req, res) => {
//   try {
//     const { type } = req.params;
//     const { vendorId } = req.query; // Get vendorId from query params

//     if (!vendorId) {
//       return res.status(400).json({ message: "Vendor ID is required" });
//     }

//     const summary = await Finance_Admin.aggregate([
//       {
//         $match: {
//           vendor: new mongoose.Types.ObjectId(vendorId),
//           type,
//         },
//       },
//       {
//         $group: {
//           _id: { $month: "$date" },
//           total: { $sum: "$amount" },
//         },
//       },
//       { $sort: { "_id": 1 } },
//     ]);

//     res.json(summary);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// // import Finance from "../../models/vendor/finance.model.js";


// // // ✅ CREATE
// // export const createFinance = async (req, res) => {
// //   try {
// //     const { type, amount, remark, date } = req.body;

// //     const finance = await Finance.create({
// //       vendor: req.vendor,
// //       type,
// //       amount,
// //       remark,
// //       date,
// //     });

// //     res.status(201).json(finance);
// //   } catch (error) {
// //     res.status(500).json({ message: error.message });
// //   }
// // };


// // // ✅ GET ALL BY TYPE (Vendor Specific)
// // export const getFinanceByType = async (req, res) => {
// //   try {
// //     const { type } = req.params;

// //     const data = await Finance.find({
// //       vendor: req.vendor,
// //       type,
// //     }).sort({ date: -1 });

// //     res.json(data);
// //   } catch (error) {
// //     res.status(500).json({ message: error.message });
// //   }
// // };


// // // ✅ DELETE
// // export const deleteFinance = async (req, res) => {
// //   try {
// //     const finance = await Finance.findOneAndDelete({
// //       _id: req.params.id,
// //       vendor: req.vendor,
// //     });

// //     if (!finance) {
// //       return res.status(404).json({ message: "Not found" });
// //     }

// //     res.json({ message: "Deleted successfully" });
// //   } catch (error) {
// //     res.status(500).json({ message: error.message });
// //   }
// // };


// // // ✅ UPDATE
// // export const updateFinance = async (req, res) => {
// //   try {
// //     const finance = await Finance.findOneAndUpdate(
// //       { _id: req.params.id, vendor: req.vendor },
// //       req.body,
// //       { new: true }
// //     );

// //     if (!finance) {
// //       return res.status(404).json({ message: "Not found" });
// //     }

// //     res.json(finance);
// //   } catch (error) {
// //     res.status(500).json({ message: error.message });
// //   }
// // };


// // // ✅ MONTHLY GRAPH DATA
// // export const getMonthlySummary = async (req, res) => {
// //   try {
// //     const { type } = req.params;

// //     const summary = await Finance.aggregate([
// //       {
// //         $match: {
// //           vendor: new mongoose.Types.ObjectId(req.vendor),
// //           type,
// //         },
// //       },
// //       {
// //         $group: {
// //           _id: { $month: "$date" },
// //           total: { $sum: "$amount" },
// //         },
// //       },
// //       { $sort: { "_id": 1 } },
// //     ]);

// //     res.json(summary);
// //   } catch (error) {
// //     res.status(500).json({ message: error.message });
// //   }
// // };