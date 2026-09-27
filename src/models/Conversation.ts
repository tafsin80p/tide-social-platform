import mongoose, { Schema, Document } from "mongoose";

export interface IConversation extends Document {
  participants: mongoose.Types.ObjectId[];
  lastMessage?: string;
  unreadCounts: Map<string, number>;
  createdAt: Date;
  updatedAt: Date;
}

const ConversationSchema: Schema = new Schema(
  {
    participants: [{ type: Schema.Types.ObjectId, ref: "User", required: true }],
    lastMessage: { type: String },
    unreadCounts: { type: Map, of: Number, default: {} },
  },
  { timestamps: true }
);

export default mongoose.models.Conversation || mongoose.model<IConversation>("Conversation", ConversationSchema);
