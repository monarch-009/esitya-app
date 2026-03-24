import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

cloudinary.config({
  cloud_name:
    process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME ||
    process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function uploadToCloudinary(
  buffer: Buffer,
  resourceType: "video" | "image" = "video",
) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "our-journey", resource_type: resourceType },
      (error: any, result: any) => {
        if (error) reject(error);
        else resolve(result);
      },
    );
    // In Node 18+ we can use web streams, or just convert buffer to stream
    const { Readable } = require("stream");
    const readable = new Readable();
    readable._read = () => {};
    readable.push(buffer);
    readable.push(null);
    readable.pipe(stream);
  });
}

export async function POST(req: Request) {
  try {
    const { url } = await req.json();

    if (!url)
      return Response.json({ message: "URL is required" }, { status: 400 });
    if (!url.includes("twitter.com") && !url.includes("x.com"))
      return Response.json({ message: "Invalid URL" }, { status: 400 });

    const tweetIdMatch = url.match(/status\/(\d+)/);
    if (!tweetIdMatch)
      return Response.json({ message: "No ID found" }, { status: 400 });

    const tweetId = tweetIdMatch[1];
    const apiUrl = `https://api.vxtwitter.com/i/status/${tweetId}`;
    const response = await fetch(apiUrl);
    if (!response.ok)
      return Response.json({ message: "Failed" }, { status: 500 });

    const data = await response.json();
    if (!data.media_extended?.[0])
      return Response.json({ message: "No media" }, { status: 404 });

    const media = data.media_extended[0];
    const isVideo = media.type === "video" || media.type === "gif";

    const mediaResponse = await fetch(media.url, {
      referrerPolicy: "no-referrer",
    });
    const buffer = Buffer.from(await mediaResponse.arrayBuffer());
    const result: any = await uploadToCloudinary(
      buffer,
      isVideo ? "video" : "image",
    );

    return Response.json({
      mediaUrl: result.secure_url,
      mediaType: isVideo ? "video" : "image",
    });
  } catch (error) {
    return Response.json({ message: "Error" }, { status: 500 });
  }
}
