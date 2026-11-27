// app/api/upload/route.ts
import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

function sanitizeFolder(rawFolder: unknown): string {
  if (typeof rawFolder !== "string") return "maveron/reviews";
  const cleaned = rawFolder.trim().replace(/^\/+|\/+$/g, "");
  return cleaned || "maveron/reviews";
}

export async function POST(req: NextRequest) {
  try {
    if (
      !process.env.CLOUDINARY_CLOUD_NAME ||
      !process.env.CLOUDINARY_API_KEY ||
      !process.env.CLOUDINARY_API_SECRET
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Cloudinary environment variables are missing on the server",
        },
        { status: 500 }
      );
    }

    const contentType = req.headers.get("content-type") || "";
    let folder = "maveron/reviews";
    let uploadTarget: string | Buffer | null = null;

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      folder = sanitizeFolder(formData.get("folder"));

      const fileEntry = formData.get("file");
      if (!fileEntry) {
        return NextResponse.json(
          { success: false, message: "Image file is required" },
          { status: 400 }
        );
      }

      if (fileEntry instanceof File) {
        if (!fileEntry.type.startsWith("image/")) {
          return NextResponse.json(
            { success: false, message: "Only image files are allowed" },
            { status: 400 }
          );
        }

        const maxBytes = 5 * 1024 * 1024; // 5 MB
        if (fileEntry.size > maxBytes) {
          return NextResponse.json(
            { success: false, message: "Image size must be under 5 MB" },
            { status: 400 }
          );
        }

        const arrayBuffer = await fileEntry.arrayBuffer();
        uploadTarget = Buffer.from(arrayBuffer);
      } else if (typeof fileEntry === "string" && fileEntry.trim()) {
        uploadTarget = fileEntry.trim();
      }
    } else {
      const body = await req.json().catch(() => null);
      folder = sanitizeFolder(body?.folder);

      if (typeof body?.file === "string" && body.file.trim()) {
        uploadTarget = body.file.trim();
      }
    }

    if (!uploadTarget) {
      return NextResponse.json(
        { success: false, message: "Image file is required" },
        { status: 400 }
      );
    }

    const result = await new Promise<{
      secure_url: string;
      public_id: string;
    }>((resolve, reject) => {
      const uploadOptions = {
        folder,
        resource_type: "image" as const,
        transformation: [{ quality: "auto", fetch_format: "auto" }],
      };

      if (Buffer.isBuffer(uploadTarget)) {
        const stream = cloudinary.uploader.upload_stream(
          uploadOptions,
          (error, uploadRes) => {
            if (error || !uploadRes?.secure_url) {
              reject(error || new Error("Cloudinary upload stream failed"));
              return;
            }
            resolve({
              secure_url: uploadRes.secure_url,
              public_id: uploadRes.public_id,
            });
          }
        );
        stream.end(uploadTarget);
      } else {
        cloudinary.uploader
          .upload(uploadTarget, uploadOptions)
          .then((uploadRes) => {
            if (!uploadRes?.secure_url) {
              reject(new Error("No secure_url returned by Cloudinary"));
              return;
            }
            resolve({
              secure_url: uploadRes.secure_url,
              public_id: uploadRes.public_id,
            });
          })
          .catch(reject);
      }
    });

    return NextResponse.json(
      {
        success: true,
        url: result.secure_url,
        publicId: result.public_id,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to upload image";
    console.error("Cloudinary upload error:", error);
    return NextResponse.json(
      { success: false, message },
      { status: 500 }
    );
  }
}