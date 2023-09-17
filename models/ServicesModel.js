import mongoose from "mongoose";

const servicesSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      // required: true,
    },
    slug: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      
    },
    cost: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    photo: {
      data: Buffer,
      contentType: String,
    },
    booking: {
      type: Boolean,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Service", servicesSchema);
