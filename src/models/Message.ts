import mongoose, { Schema, Document } from "mongoose";

export interface IMessage extends Document {
  conversationId: mongoose.Types.ObjectId;
  senderId: mongoose.Types.ObjectId;
  text: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'video' | 'audio';
  reactions: { emoji: string; userId: mongoose.Types.ObjectId }[];
  replyTo?: mongoose.Types.ObjectId;
  deletedFor: string[];
  isDeletedForEveryone: boolean;
  isEdited: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const MessageSchema: Schema = new Schema(
  {
    conversationId: { type: Schema.Types.ObjectId, ref: "Conversation", required: true },
    senderId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    text: { type: String, required: false },
    mediaUrl: { type: String, required: false },
    mediaType: { type: String, enum: ['image', 'video', 'audio'], required: false },
    reactions: [
      {
        emoji: { type: String, required: true },
        userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
      },
    ],
    replyTo: { type: Schema.Types.ObjectId, ref: "Message" },
    deletedFor: [{ type: String }],
    isDeletedForEveryone: { type: Boolean, default: false },
    isEdited: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.models.Message || mongoose.model<IMessage>("Message", MessageSchema);
