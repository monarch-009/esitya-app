import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
import path from "path";
import { extractUser } from "../../../lib/auth";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

cloudinary.config({
  cloud_name:
    process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME ||
    process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req: Request) {
  try {
    const user = extractUser(req);
    if (!user)
      return Response.json({ message: "Unauthorized" }, { status: 401 });

    const formData = await req.formData();
    const file = (formData as any).get("file");

    if (!file) {
      return Response.json({ message: "No file found" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadResponse: any = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: "our-journey", resource_type: "auto" },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        },
      );
      const { Readable } = require("stream");
      const readable = new Readable();
      readable._read = () => {};
      readable.push(buffer);
      readable.push(null);
      readable.pipe(stream);
    });

    return Response.json({ url: uploadResponse.secure_url });
  } catch (error: any) {
    console.error("Cloudinary Upload Error:", error);
    return Response.json(
      { message: "Upload failed: " + (error.message || "Unknown error") },
      { status: 500 },
    );
  }
}
