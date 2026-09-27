"use server";

import connectDB from "@/lib/mongodb";
import { Notification } from "@/models/Notification";
import { getUserSession } from "./auth";
import { revalidatePath } from "next/cache";

export async function getNotifications() {
  try {
    await connectDB();
    const session = await getUserSession();
    if (!session) return { success: false, notifications: [] };

    const notifications = await Notification.find({ recipient: session.id })
      .populate("sender", "name avatar")
      .sort({ createdAt: -1 })
      .limit(30)
      .lean();

    return { success: true, notifications: JSON.parse(JSON.stringify(notifications)) };
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return { success: false, notifications: [] };
  }
}

export async function markNotificationAsRead(notificationId: string) {
  try {
    await connectDB();
    const session = await getUserSession();
    if (!session) return { success: false };

    await Notification.findOneAndUpdate(
      { _id: notificationId, recipient: session.id },
      { read: true }
    );
    
    return { success: true };
  } catch (error) {
    return { success: false };
  }
}

export async function markAllNotificationsAsRead() {
  try {
    await connectDB();
    const session = await getUserSession();
    if (!session) return { success: false };

    await Notification.updateMany(
      { recipient: session.id, read: false },
      { read: true }
    );
    
    return { success: true };
  } catch (error) {
    return { success: false };
  }
}
