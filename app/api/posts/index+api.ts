import { extractUser } from "../../../lib/auth";
import connectDB, { Post, User } from "../../../lib/db";

export async function GET(req: Request) {
  try {
    const user = extractUser(req) as any;
    if (!user)
      return Response.json({ message: "Unauthorized" }, { status: 401 });

    await connectDB();
    const posts = await Post.find({ isSnap: { $ne: true } })
      .populate({
        path: "author",
        model: User,
        select: "name profileImage email",
      })
      .populate({
        path: "comments.author",
        model: User,
        select: "name profileImage email",
      })
      .sort({ createdAt: -1 })
      .limit(100);

    return Response.json(posts);
  } catch (error: any) {
    console.error("Fetch posts error", error);
    return Response.json(
      { message: "Error", details: error.message || String(error) },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  try {
    const user = extractUser(req) as any;
    if (!user)
      return Response.json({ message: "Unauthorized" }, { status: 401 });

    const data = await req.json();
    await connectDB();

    const newPost = await Post.create({
      ...data,
      author: user.id,
    });

    const populated = await Post.findById(newPost._id).populate({
      path: "author",
      model: User,
      select: "name profileImage email",
    });
    return Response.json(populated, { status: 201 });
  } catch (error: any) {
    console.error("Post creation error:", error);
    return Response.json(
      {
        message: "Post creation failed: " + (error.message || "Unknown error"),
      },
      { status: 500 },
    );
  }
}
