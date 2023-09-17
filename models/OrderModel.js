import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    services: [
      {
        type: mongoose.ObjectId,
        ref: "Service",
      },
    ],
    payment: {},
    buyer: {
      type: mongoose.ObjectId,
      ref: "Users",
    },
    status: {
      type: String,
      default: "In Process",
      enum: ["In Process", "Ready for Delivery",  "Completed", "Cancelled"],
    }
  },
  { timestamps: true }
);

export default mongoose.model("Order", orderSchema);