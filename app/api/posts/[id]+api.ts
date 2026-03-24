import connectDB from "../../../lib/db";
import Post from "../../../models/Post.js";
import { extractUser } from "../../../lib/auth";

export async function PUT(req: Request, { id }: { id: string }) {
  try {
    const user = extractUser(req);
    if (!user)
      return Response.json({ message: "Unauthorized" }, { status: 401 });

    const data = await req.json();
    await connectDB();

    // Support toggling like if action type is provided
    if (data.action === "like") {
      const post = await Post.findById(id);
      if (!post)
        return Response.json({ message: "Not found" }, { status: 404 });

      const index = post.likes.indexOf(user.id);
      if (index > -1) {
        post.likes.splice(index, 1);
      } else {
        post.likes.push(user.id);
      }
      await post.save();
      return Response.json(post);
    }

    // Otherwise standard update
    if (user.role !== "admin" && user.id !== data.authorId) {
      return Response.json({ message: "Forbidden" }, { status: 403 });
    }

    const updated = await Post.findByIdAndUpdate(id, data, { new: true });
    return Response.json(updated);
  } catch (error) {
    return Response.json({ message: "Error" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { id }: { id: string }) {
  try {
    const user = extractUser(req);
    if (!user)
      return Response.json({ message: "Unauthorized" }, { status: 401 });

    await connectDB();
    const post = await Post.findById(id);
    if (!post) return Response.json({ message: "Not found" }, { status: 404 });

    if (user.role !== "admin" && user.id !== post.author?._id.toString()) {
      return Response.json({ message: "Forbidden" }, { status: 403 });
    }

    await Post.findByIdAndDelete(id);
    return Response.json({ message: "Deleted" });
  } catch (error) {
    return Response.json({ message: "Error" }, { status: 500 });
  }
}
