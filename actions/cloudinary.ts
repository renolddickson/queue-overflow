"use server";

import crypto from "crypto";

/**
 * Extracts the public_id from a Cloudinary URL.
 * Example: https://res.cloudinary.com/demo/image/upload/v12345/folder/subfolder/image.jpg
 * Returns: folder/subfolder/image
 */
export async function getPublicIdFromUrl(url: string | null): Promise<string | null> {
  if (!url || !url.includes("cloudinary.com")) return null;
  
  try {
    const parts = url.split("/");
    const uploadIndex = parts.indexOf("upload");
    if (uploadIndex === -1) return null;
    
    // Everything after /v[version]/ is the public_id (without extension)
    // Sometimes the version part is missing
    let startIndex = uploadIndex + 1;
    if (parts[startIndex].startsWith("v") && !isNaN(Number(parts[startIndex].substring(1)))) {
      startIndex++;
    }
    
    const publicIdWithExt = parts.slice(startIndex).join("/");
    const publicId = publicIdWithExt.split(".")[0];
    
    return publicId;
  } catch (error) {
    console.error("Error extracting public_id from URL:", error);
    return null;
  }
}

/**
 * Deletes an image from Cloudinary using the Admin API (via fetch).
 */
export async function deleteFromCloudinary(publicId: string | null) {
  if (!publicId) return { success: false, message: "No publicId provided" };

  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY;
  const apiSecret = process.env.NEXT_PUBLIC_CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    console.error("Cloudinary credentials missing in environment variables");
    return { success: false, message: "Credentials missing" };
  }

  const timestamp = Math.round(new Date().getTime() / 1000);
  const signature = crypto
    .createHash("sha1")
    .update(`public_id=${publicId}&timestamp=${timestamp}${apiSecret}`)
    .digest("hex");

  try {
    const formData = new FormData();
    formData.append("public_id", publicId);
    formData.append("signature", signature);
    formData.append("api_key", apiKey);
    formData.append("timestamp", timestamp.toString());

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`,
      {
        method: "POST",
        body: formData,
      }
    );

    const result = await response.json();
    
    if (result.result === "ok") {
      console.log(`Successfully deleted from Cloudinary: ${publicId}`);
      return { success: true, result: "ok" };
    } else {
      console.warn(`Cloudinary deletion returned: ${result.result}`, result);
      return { success: false, result: result.result };
    }
  } catch (error) {
    console.error("Error deleting from Cloudinary:", error);
    return { success: false, error };
  }
}

/**
 * Helper to delete by URL directly
 */
export async function deleteCloudinaryByUrl(url: string | null) {
  const publicId = await getPublicIdFromUrl(url);
  if (publicId) {
    return await deleteFromCloudinary(publicId);
  }
  return { success: false, message: "Invalid URL or not a Cloudinary image" };
}
