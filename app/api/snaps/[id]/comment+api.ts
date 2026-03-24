import connectDB, { Snap, User } from "../../../../lib/db";
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
    const snap = await Snap.findById(id);
    if (!snap)
      return Response.json({ message: "Snap not found" }, { status: 404 });

    snap.comments.push({
      text,
      author: user.id || user._id,
    });

    await snap.save();

    const populated = await Snap.findById(id)
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
    console.error("Snap comment error:", error);
    return Response.json(
      { message: "Error adding comment: " + error.message },
      { status: 500 },
    );
  }
}
