import mongoose from "mongoose";

const contentMessageSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["file", "text"],
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
  },
  { _id: false }
);

const messageSchema = new mongoose.Schema(
  {
    from: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    to: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    contentMessage: {
      type: contentMessageSchema,
      required: true,
    },
  },
  { timestamps: true }
);

messageSchema.index({ from: 1, to: 1, createdAt: -1 });
messageSchema.index({ to: 1, from: 1, createdAt: -1 });

export const Message = mongoose.model("Message", messageSchema);
