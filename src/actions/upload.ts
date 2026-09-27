"use server";

import { getUserSession } from "@/actions/auth";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function uploadMedia(formData: FormData) {
  try {
    const session = await getUserSession();
    if (!session) {
      return { error: "Unauthorized" };
    }

    const file = formData.get("file") as File;
    if (!file) {
      return { error: "No file provided" };
    }

    const buffer = await file.arrayBuffer();
    const base64String = Buffer.from(buffer).toString("base64");
    const dataUri = `data:${file.type};base64,${base64String}`;
    const resourceType = file.type.startsWith("image/") ? "image" : file.type.startsWith("video/") || file.type.startsWith("audio/") ? "video" : "raw";

    const uploadOptions: any = {
      resource_type: resourceType,
    };

    if (resourceType === "image") {
      uploadOptions.format = "webp";
      uploadOptions.quality = "auto:best";
    }

    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload(dataUri, uploadOptions, (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      });
    });

    const typedResult = result as any;

    return {
      success: true,
      url: typedResult.secure_url,
      type: file.type.split('/')[0],
    };
  } catch (error: any) {
    console.error("Upload error:", error);
    return { error: error.message || "Failed to upload file" };
  }
}
