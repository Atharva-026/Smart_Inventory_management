import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  itemId: { type: mongoose.Schema.Types.ObjectId, ref: "Item", required: true },
  borrowedAt: { type: Date, default: Date.now },
  returnedAt: { type: Date },
  status: { type: String, enum: ["borrowed","returned"], default: "borrowed" }
});

export default mongoose.model("Transaction", transactionSchema);
