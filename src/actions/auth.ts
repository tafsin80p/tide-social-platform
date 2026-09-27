"use server";

import { cookies } from "next/headers";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import { signToken, verifyToken } from "@/lib/jwt";

export async function registerUser(formData: FormData) {
  try {
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const gender = formData.get("gender") as string || "other";

    if (!name || !email || !password) {
      return { error: "Please fill all fields." };
    }

    await connectDB();

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return { error: "User with this email already exists." };
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Use selected gender to assign correct avatar
    const firstName = name.split(" ")[0];
    let avatarUrl = "https://avatar.iran.liara.run/public";
    
    if (gender === "male") {
      avatarUrl = `https://avatar.iran.liara.run/public/boy?username=${encodeURIComponent(firstName)}`;
    } else if (gender === "female") {
      avatarUrl = `https://avatar.iran.liara.run/public/girl?username=${encodeURIComponent(firstName)}`;
    } else {
      avatarUrl = `https://avatar.iran.liara.run/public?username=${encodeURIComponent(firstName)}`;
    }

    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      avatar: avatarUrl,
      gender: gender
    });

    return { success: true };
  } catch (error: any) {
    return { error: error.message || "An error occurred during registration." };
  }
}

export async function loginUser(formData: FormData) {
  try {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (!email || !password) {
      return { error: "Please provide email and password." };
    }

    await connectDB();

    const user = await User.findOne({ email });
    if (!user) {
      return { error: "Invalid credentials." };
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return { error: "Invalid credentials." };
    }

    // Generate JWT
    const token = await signToken({
      userId: user._id.toString(),
      name: user.name,
      email: user.email,
      avatar: user.avatar,
    });

    // Set HTTP-only cookie
    (await cookies()).set("tido_auth", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: "/",
    });

    return { success: true };
  } catch (error: any) {
    return { error: error.message || "An error occurred during login." };
  }
}

export async function logoutUser() {
  (await cookies()).delete("tido_auth");
  return { success: true };
}

export async function getUserSession() {
  const token = (await cookies()).get("tido_auth")?.value;
  if (!token) return null;

  const payload = await verifyToken(token);
  if (!payload) return null;

  return {
    id: payload.userId as string,
    name: payload.name as string,
    email: payload.email as string,
    avatar: payload.avatar as string,
  };
}

export async function updateUserActivity() {
  try {
    const session = await getUserSession();
    if (!session) return;
    await connectDB();
    const updated = await User.findByIdAndUpdate(session.id, { lastActive: new Date() }, { new: true });
    console.log(`Updated user ${session.name} lastActive to:`, updated?.lastActive);
    return { success: true, lastActive: updated?.lastActive };
  } catch (error) {
    console.error("Failed to update user activity", error);
  }
}

export async function updateUserProfile(data: { name?: string, avatar?: string }) {
  try {
    const session = await getUserSession();
    if (!session) return { error: "Unauthorized" };

    await connectDB();
    const updateData: any = {};
    if (data.name) updateData.name = data.name;
    if (data.avatar) updateData.avatar = data.avatar;

    const updatedUser = await User.findByIdAndUpdate(session.id, updateData, { new: true });
    if (!updatedUser) return { error: "User not found" };

    // Generate new JWT
    const token = await signToken({
      userId: updatedUser._id.toString(),
      name: updatedUser.name,
      email: updatedUser.email,
      avatar: updatedUser.avatar,
    });

    // Update HTTP-only cookie
    (await cookies()).set("tido_auth", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: "/",
    });

    const { revalidatePath } = await import("next/cache");
    revalidatePath("/", "layout");

    return { success: true, user: { id: updatedUser._id, name: updatedUser.name, avatar: updatedUser.avatar } };
  } catch (error: any) {
    console.error("Failed to update user profile", error);
    return { error: error.message || "An error occurred." };
  }
}
