"use server";

import connectDB from "@/lib/mongodb";
import { FriendRequest } from "@/models/FriendRequest";
import User from "@/models/User";
import Conversation from "@/models/Conversation";
import { Notification } from "@/models/Notification";
import { sendPushNotification } from "@/lib/onesignal";
import { getUserSession } from "./auth";
import { revalidatePath } from "next/cache";

export async function sendFriendRequest(receiverId: string) {
  try {
    await connectDB();
    const session = await getUserSession();
    if (!session) return { success: false, error: "Unauthorized" };

    const senderId = session.id;
    
    // Check if already requested
    const existing = await FriendRequest.findOne({
      $or: [
        { sender: senderId, receiver: receiverId },
        { sender: receiverId, receiver: senderId }
      ],
      status: "pending"
    });

    if (existing) {
      return { success: false, error: "Request already exists." };
    }

    const request = await FriendRequest.create({
      sender: senderId,
      receiver: receiverId
    });

    await Notification.create({
      recipient: receiverId,
      sender: senderId,
      type: "friend_request"
    });

    await sendPushNotification(
      [receiverId.toString()],
      "New Friend Request",
      `${session.name} sent you a friend request.`,
      "/requests"
    );

    revalidatePath("/find-friend");
    revalidatePath("/requests");
    
    return { success: true, request: JSON.parse(JSON.stringify(request)) };
  } catch (error) {
    console.error("Error sending friend request:", error);
    return { success: false, error: "Failed to send request." };
  }
}

export async function getPendingRequests() {
  try {
    await connectDB();
    const session = await getUserSession();
    if (!session) return { success: false, requests: [] };

    const requests = await FriendRequest.find({
      receiver: session.id,
      status: "pending"
    }).populate("sender", "name email avatar");

    return { success: true, requests: JSON.parse(JSON.stringify(requests)) };
  } catch (error) {
    return { success: false, requests: [] };
  }
}

export async function respondToRequest(requestId: string, action: "accepted" | "rejected") {
  try {
    await connectDB();
    const session = await getUserSession();
    if (!session) return { success: false, error: "Unauthorized" };

    const request = await FriendRequest.findOne({ _id: requestId, receiver: session.id });
    if (!request) return { success: false, error: "Request not found." };

    request.status = action;
    await request.save();

    if (action === "accepted") {
      // Create conversation
      let conversation = await Conversation.findOne({
        isGroup: false,
        participants: { $all: [request.sender, request.receiver] },
      });

      if (!conversation) {
        conversation = await Conversation.create({
          isGroup: false,
          participants: [request.sender, request.receiver],
        });
      }

      await Notification.create({
        recipient: request.sender,
        sender: session.id,
        type: "request_accepted"
      });

      await sendPushNotification(
        [request.sender.toString()],
        "Request Accepted",
        `${session.name} accepted your friend request.`,
        "/"
      );
    }

    revalidatePath("/requests");
    revalidatePath("/");
    
    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to process request." };
  }
}

export async function getSuggestedUsers(searchQuery?: string) {
  try {
    await connectDB();
    const session = await getUserSession();
    if (!session) return { success: false, users: [] };

    // Find all relationships (pending or accepted) involving current user
    const relationships = await FriendRequest.find({
      $or: [{ sender: session.id }, { receiver: session.id }],
      status: { $in: ["pending", "accepted"] }
    });

    const relatedUserIds = relationships.map(r => 
      r.sender.toString() === session.id ? r.receiver.toString() : r.sender.toString()
    );

    // If searching, show everyone matching the query (even friends)
    let query: any = { _id: { $ne: session.id } };
    
    if (searchQuery) {
      query.name = { $regex: searchQuery, $options: "i" };
    } else {
      // If NOT searching, exclude related users (suggestions mode)
      query._id = { $ne: session.id, $nin: relatedUserIds };
    }

    const users = await User.find(query).select("name email avatar lastActive").limit(20).lean();

    // Map through users to add relationship status
    const mappedUsers = users.map(user => {
      const rel = relationships.find(r => 
        r.sender.toString() === user._id.toString() || 
        r.receiver.toString() === user._id.toString()
      );
      
      let status = "none";
      if (rel) {
        if (rel.status === "accepted") status = "friend";
        else if (rel.status === "pending") {
          status = rel.sender.toString() === session.id ? "sent" : "received";
        }
      }

      return {
        ...user,
        relationship: status // "none", "friend", "sent", "received"
      };
    });

    return { success: true, users: JSON.parse(JSON.stringify(mappedUsers)) };
  } catch (error) {
    return { success: false, users: [] };
  }
}

export async function unfriendUser(friendId: string) {
  try {
    await connectDB();
    const session = await getUserSession();
    if (!session) return { success: false, error: "Unauthorized" };

    await FriendRequest.findOneAndDelete({
      $or: [
        { sender: session.id, receiver: friendId },
        { sender: friendId, receiver: session.id }
      ],
      status: "accepted"
    });

    revalidatePath("/find-friend");
    revalidatePath("/requests");
    
    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to unfriend." };
  }
}

export async function getFriends() {
  try {
    await connectDB();
    const session = await getUserSession();
    if (!session) return { success: false, friends: [] };

    const friendships = await FriendRequest.find({
      $or: [{ sender: session.id }, { receiver: session.id }],
      status: "accepted"
    }).populate("sender receiver", "name email avatar lastActive");

    const friends = friendships.map((f: any) => {
      const sender = f.sender;
      const receiver = f.receiver;
      if (sender._id.toString() === session.id) {
        return receiver;
      }
      return sender;
    });

    return { success: true, friends: JSON.parse(JSON.stringify(friends)) };
  } catch (error) {
    return { success: false, friends: [] };
  }
}
