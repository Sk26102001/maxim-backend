import Bank from "../../models/bank/vendorBank.model.js";

// @desc    Get all banks
export const getBanks = async (req, res) => {
  try {
    const { search } = req.query;
    let query = {};

    if (search) {
      query = {
        $or: [
          { bankName: { $regex: search, $options: "i" } },
          { accountHolderName: { $regex: search, $options: "i" } },
          { accountNumber: { $regex: search, $options: "i" } },
          { ifscCode: { $regex: search, $options: "i" } },
        ],
      };
    }

    const banks = await Bank.find(query).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: banks.length,
      data: banks,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// @desc    Get single bank
export const getBank = async (req, res) => {
  try {
    const bank = await Bank.findById(req.params.id);

    if (!bank) {
      return res.status(404).json({
        success: false,
        error: "Bank not found",
      });
    }

    res.status(200).json({
      success: true,
      data: bank,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// @desc    Create new bank
// export const createBank = async (req, res) => {
//   try {
//     const bank = await Bank.create(req.body);

//     res.status(201).json({
//       success: true,
//       data: bank,
//       message: "Bank created successfully",
//     });
//   } catch (error) {
//     if (error.code === 11000) {
//       return res.status(400).json({
//         success: false,
//         error: "Account number already exists",
//       });
//     }

//     res.status(500).json({
//       success: false,
//       error: error.message,
//     });
//   }
// };
export const createBank = async (req, res) => {
  try {
    const bankData = {
      ...req.body,
      qrImage: req.file ? req.file.path : "",
    };

    const bank = await Bank.create(bankData);

    res.status(201).json({
      success: true,
      data: bank,
      message: "Bank created successfully",
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        error: "Account number already exists",
      });
    }

    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// @desc    Update bank
// export const updateBank = async (req, res) => {
//   try {
//     const bank = await Bank.findByIdAndUpdate(req.params.id, req.body, {
//       new: true,
//       runValidators: true,
//     });

//     if (!bank) {
//       return res.status(404).json({
//         success: false,
//         error: "Bank not found",
//       });
//     }

//     res.status(200).json({
//       success: true,
//       data: bank,
//       message: "Bank updated successfully",
//     });
//   } catch (error) {
//     if (error.code === 11000) {
//       return res.status(400).json({
//         success: false,
//         error: "Account number already exists",
//       });
//     }

//     res.status(500).json({
//       success: false,
//       error: error.message,
//     });
//   }
// };
export const updateBank = async (req, res) => {
  try {
    const updateData = {
      ...req.body,
    };

    if (req.file) {
      updateData.qrImage = req.file.path;
    }

    const bank = await Bank.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!bank) {
      return res.status(404).json({
        success: false,
        error: "Bank not found",
      });
    }

    res.status(200).json({
      success: true,
      data: bank,
      message: "Bank updated successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// @desc    Delete bank
export const deleteBank = async (req, res) => {
  try {
    const bank = await Bank.findByIdAndDelete(req.params.id);

    if (!bank) {
      return res.status(404).json({
        success: false,
        error: "Bank not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Bank deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// @desc    Update bank status
export const updateBankStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!["Active", "Inactive"].includes(status)) {
      return res.status(400).json({
        success: false,
        error: "Invalid status value",
      });
    }

    const bank = await Bank.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    if (!bank) {
      return res.status(404).json({
        success: false,
        error: "Bank not found",
      });
    }

    res.status(200).json({
      success: true,
      data: bank,
      message: "Bank status updated successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// import  Bank from'../models/vendorBank.model.js';

// // @desc    Get all banks
// // @route   GET /api/banks
// // @access  Public
// const getBanks = async (req, res) => {
//   try {
//     const { search } = req.query;
//     let query = {};

//     // Add search functionality
//     if (search) {
//       query = {
//         $or: [
//           { bankName: { $regex: search, $options: 'i' } },
//           { accountHolderName: { $regex: search, $options: 'i' } },
//           { accountNumber: { $regex: search, $options: 'i' } },
//           { ifscCode: { $regex: search, $options: 'i' } }
//         ]
//       };
//     }

//     const banks = await Bank.find(query).sort({ createdAt: -1 });
//     res.status(200).json({
//       success: true,
//       count: banks.length,
//       data: banks
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       error: error.message
//     });
//   }
// };

// // @desc    Get single bank
// // @route   GET /api/banks/:id
// // @access  Public
// const getBank = async (req, res) => {
//   try {
//     const bank = await Bank.findById(req.params.id);
    
//     if (!bank) {
//       return res.status(404).json({
//         success: false,
//         error: 'Bank not found'
//       });
//     }

//     res.status(200).json({
//       success: true,
//       data: bank
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       error: error.message
//     });
//   }
// };

// // @desc    Create new bank
// // @route   POST /api/banks
// // @access  Public
// const createBank = async (req, res) => {
//   try {
//     const bank = await Bank.create(req.body);
    
//     res.status(201).json({
//       success: true,
//       data: bank,
//       message: 'Bank created successfully'
//     });
//   } catch (error) {
//     // Handle duplicate key error
//     if (error.code === 11000) {
//       return res.status(400).json({
//         success: false,
//         error: 'Account number already exists'
//       });
//     }
    
//     res.status(500).json({
//       success: false,
//       error: error.message
//     });
//   }
// };

// // @desc    Update bank
// // @route   PUT /api/banks/:id
// // @access  Public
// const updateBank = async (req, res) => {
//   try {
//     const bank = await Bank.findByIdAndUpdate(
//       req.params.id,
//       req.body,
//       {
//         new: true,
//         runValidators: true
//       }
//     );

//     if (!bank) {
//       return res.status(404).json({
//         success: false,
//         error: 'Bank not found'
//       });
//     }

//     res.status(200).json({
//       success: true,
//       data: bank,
//       message: 'Bank updated successfully'
//     });
//   } catch (error) {
//     // Handle duplicate key error
//     if (error.code === 11000) {
//       return res.status(400).json({
//         success: false,
//         error: 'Account number already exists'
//       });
//     }
    
//     res.status(500).json({
//       success: false,
//       error: error.message
//     });
//   }
// };

// // @desc    Delete bank
// // @route   DELETE /api/banks/:id
// // @access  Public
// const deleteBank = async (req, res) => {
//   try {
//     const bank = await Bank.findByIdAndDelete(req.params.id);

//     if (!bank) {
//       return res.status(404).json({
//         success: false,
//         error: 'Bank not found'
//       });
//     }

//     res.status(200).json({
//       success: true,
//       message: 'Bank deleted successfully'
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       error: error.message
//     });
//   }
// };

// // @desc    Update bank status
// // @route   PATCH /api/banks/:id/status
// // @access  Public
// const updateBankStatus = async (req, res) => {
//   try {
//     const { status } = req.body;
    
//     if (!['Active', 'Inactive'].includes(status)) {
//       return res.status(400).json({
//         success: false,
//         error: 'Invalid status value'
//       });
//     }

//     const bank = await Bank.findByIdAndUpdate(
//       req.params.id,
//       { status },
//       {
//         new: true,
//         runValidators: true
//       }
//     );

//     if (!bank) {
//       return res.status(404).json({
//         success: false,
//         error: 'Bank not found'
//       });
//     }

//     res.status(200).json({
//       success: true,
//       data: bank,
//       message: 'Bank status updated successfully'
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       error: error.message
//     });
//   }
// };

// module.exports = {
//   getBanks,
//   getBank,
//   createBank,
//   updateBank,
//   deleteBank,
//   updateBankStatus
// };