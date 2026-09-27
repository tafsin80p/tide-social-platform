"use server";

import connectDB from "@/lib/mongodb";
import Conversation from "@/models/Conversation";
import Message from "@/models/Message";
import User from "@/models/User";
import { getUserSession } from "./auth";
import { revalidatePath } from "next/cache";

export async function getConversations() {
  try {
    const session = await getUserSession();
    if (!session) return { error: "Unauthorized" };

    await connectDB();

    const conversations = await Conversation.find({ participants: session.id })
      .populate("participants", "name email avatar lastActive")
      .sort({ updatedAt: -1 })
      .lean();

    return {
      success: true,
      conversations: JSON.parse(JSON.stringify(conversations)),
    };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function getMessages(conversationId: string) {
  try {
    const session = await getUserSession();
    if (!session) return { error: "Unauthorized" };

    await connectDB();

    const messages = await Message.find({ 
      conversationId,
      deletedFor: { $ne: session.id }
    })
      .populate("senderId", "name avatar")
      .populate("replyTo", "text senderId isDeletedForEveryone")
      .sort({ createdAt: 1 })
      .lean();

    return {
      success: true,
      messages: JSON.parse(JSON.stringify(messages)),
    };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function sendMessage(conversationId: string, text: string, replyToId?: string, mediaUrl?: string, mediaType?: 'image' | 'video' | 'audio') {
  try {
    const session = await getUserSession();
    if (!session) return { error: "Unauthorized" };
    if (!text.trim() && !mediaUrl) return { error: "Message cannot be empty" };

    await connectDB();

    const newMessageData: any = {
      conversationId,
      senderId: session.id,
      text: text || "",
    };
    if (replyToId) newMessageData.replyTo = replyToId;
    if (mediaUrl) {
      newMessageData.mediaUrl = mediaUrl;
      newMessageData.mediaType = mediaType;
    }

    const newMessage = await Message.create(newMessageData);

    const conversation = await Conversation.findById(conversationId);
    if (conversation) {
      const otherParticipant = conversation.participants.find((p: any) => p.toString() !== session.id);
      if (otherParticipant) {
        const otherIdStr = otherParticipant.toString();
        const currentCount = conversation.unreadCounts?.get(otherIdStr) || 0;
        if (!conversation.unreadCounts) conversation.unreadCounts = new Map();
        conversation.unreadCounts.set(otherIdStr, currentCount + 1);
      }
      conversation.lastMessage = text;
      await conversation.save();
    }

    revalidatePath("/");
    
    return { success: true, message: JSON.parse(JSON.stringify(newMessage)) };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function markAsRead(conversationId: string) {
  try {
    const session = await getUserSession();
    if (!session) return { error: "Unauthorized" };
    
    await connectDB();
    const conversation = await Conversation.findById(conversationId);
    
    if (conversation) {
      if (!conversation.unreadCounts) conversation.unreadCounts = new Map();
      conversation.unreadCounts.set(session.id, 0);
      await conversation.save();
    }
    
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function getUnreadCounts() {
  try {
    const session = await getUserSession();
    if (!session) return { error: "Unauthorized" };

    await connectDB();
    const conversations = await Conversation.find({ participants: session.id }).lean();
    
    let totalUnread = 0;
    for (const conv of conversations) {
      const count = conv.unreadCounts?.[session.id] || 0;
      totalUnread += count;
    }

    return { success: true, count: totalUnread };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function toggleReaction(messageId: string, emoji: string) {
  try {
    const session = await getUserSession();
    if (!session) return { error: "Unauthorized" };

    await connectDB();
    const message = await Message.findById(messageId);
    if (!message) return { error: "Message not found" };

    if (!message.reactions) {
      message.reactions = [];
    }

    const existingReactionIndex = message.reactions.findIndex(
      (r: any) => r.userId.toString() === session.id && r.emoji === emoji
    );

    let isAdded = false;
    if (existingReactionIndex > -1) {
      // Remove reaction if it already exists
      message.reactions.splice(existingReactionIndex, 1);
    } else {
      // Add reaction
      message.reactions.push({ emoji, userId: session.id });
      isAdded = true;
    }

    await message.save();

    if (isAdded) {
      const conversation = await Conversation.findById(message.conversationId);
      if (conversation) {
        const reactorName = session.name.split(' ')[0];
        // If the reacting user is reacting to someone else's message, increment unread for them
        conversation.lastMessageText = `${reactorName} reacted ${emoji} to a message`;
        
        conversation.participants.forEach((pId: any) => {
          if (pId.toString() !== session.id) {
            const currentCount = conversation.unreadCounts?.get(pId.toString()) || 0;
            if (!conversation.unreadCounts) {
              conversation.unreadCounts = new Map();
            }
            conversation.unreadCounts.set(pId.toString(), currentCount + 1);
          }
        });
        
        await conversation.save();
      }
    }

    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function editMessage(messageId: string, newText: string) {
  try {
    const session = await getUserSession();
    if (!session) return { error: "Unauthorized" };

    await connectDB();
    const message = await Message.findById(messageId);
    if (!message) return { error: "Message not found" };

    if (message.senderId.toString() !== session.id) {
      return { error: "Not authorized to edit this message" };
    }

    message.text = newText;
    message.isEdited = true;
    await message.save();

    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function deleteMessage(messageId: string, type: 'me' | 'everyone') {
  try {
    const session = await getUserSession();
    if (!session) return { error: "Unauthorized" };

    await connectDB();
    const message = await Message.findById(messageId);
    if (!message) return { error: "Message not found" };

    if (type === 'everyone') {
      if (message.senderId.toString() !== session.id) {
        return { error: "Not authorized to delete for everyone" };
      }
      message.isDeletedForEveryone = true;
      message.text = "This message was deleted.";
    } else {
      if (!message.deletedFor) message.deletedFor = [];
      if (!message.deletedFor.includes(session.id)) {
        message.deletedFor.push(session.id);
      }
    }

    await message.save();
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function getAllUsers() {
  try {
    const session = await getUserSession();
    if (!session) return { error: "Unauthorized" };

    await connectDB();

    const users = await User.find({ _id: { $ne: session.id } })
      .select("name email avatar")
      .lean();

    return {
      success: true,
      users: JSON.parse(JSON.stringify(users)),
    };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function startConversation(userId: string) {
  try {
    const session = await getUserSession();
    if (!session) return { error: "Unauthorized" };

    await connectDB();

    let conversation = await Conversation.findOne({
      participants: { $all: [session.id, userId] }
    });

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [session.id, userId],
      });
    }

    revalidatePath("/");
    
    return {
      success: true,
      conversationId: conversation._id.toString(),
    };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function getConversationById(conversationId: string) {
  try {
    const session = await getUserSession();
    if (!session) return { error: "Unauthorized" };

    await connectDB();

    const conversation = await Conversation.findById(conversationId)
      .populate("participants", "name email avatar lastActive")
      .lean();

    if (!conversation) return { error: "Not found" };

    return {
      success: true,
      conversation: JSON.parse(JSON.stringify(conversation)),
    };
  } catch (error: any) {
    return { error: error.message };
  }
}
