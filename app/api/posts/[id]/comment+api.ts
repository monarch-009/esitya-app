import connectDB, { Post, User } from "../../../../lib/db";
import { extractUser } from "../../../../lib/auth";

export async function POST(req: Request, { id }: { id: string }) {
  try {
    const user = extractUser(req);
    if (!user)
      return Response.json({ message: "Unauthorized" }, { status: 401 });

    const { text } = await req.json();
    if (!text)
      return Response.json(
        { message: "Comment text required" },
        { status: 400 },
      );

    await connectDB();
    const post = await Post.findById(id);
    if (!post)
      return Response.json({ message: "Post not found" }, { status: 404 });

    post.comments.push({
      text,
      author: user.id,
    });

    await post.save();

    const populated = await Post.findById(id)
      .populate({
        path: "author",
        model: User,
        select: "name profileImage email",
      })
      .populate({
        path: "comments.author",
        model: User,
        select: "name profileImage email",
      });

    return Response.json(populated);
  } catch (error: any) {
    console.error("Comment error:", error);
    return Response.json(
      { message: "Error adding comment: " + error.message },
      { status: 500 },
    );
  }
}
