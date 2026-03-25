import mongoose from "mongoose"

const inventoryLogSchema = new mongoose.Schema(
    {
        action: { type: String, required: true },
        timestamp: { type: Date, default: Date.now },

        inventory: {
            id: { type: mongoose.Schema.Types.ObjectId, ref: "Inventory2" },
            agencyId: mongoose.Schema.Types.ObjectId,
            status: String,

            airline: {
                name: String,
                code: String,
                flightNumber: String,
            },

            route: {
                from: {
                    city: String,
                    code: String,
                },
                to: {
                    city: String,
                    code: String,
                },
            },

            validity: {
                dateFrom: String,
                dateTo: String,
            },

            pricing: {
                basePrice: Number,
                tax: Number,
                totalPrice: Number,
                infantPrice: Number,
            },

            cancellationCharges: Number,
            rescheduleCharges: Number,

            createdAt: String,
            updatedAt: String,
        },

        inventoryDate: {
            id: mongoose.Schema.Types.ObjectId,
            travelDate: String,
            departureTime: String,
            arrivalTime: String,
            pnr: String,
            groupCode: String,

            seats: {
                total: Number,
                booked: Number,
                available: Number,
            },

            status: String,
        },

        passengers: [
            {
                id: mongoose.Schema.Types.ObjectId,
                name: String,
                agent: {
                    id: mongoose.Schema.Types.ObjectId,
                    name: String,
                    email: String,
                },
                infant: {
                    title: String,
                    firstName: String,
                    lastName: String,
                    dob: Date,
                    price: Number,
                },
                status: String,
                price: Number,
            },
        ],
    },
    { timestamps: true }
)

export default mongoose.model("InventoryLog2", inventoryLogSchema)
