import connectDB, { Snap, User } from "../../../../lib/db";
import { extractUser } from "../../../../lib/auth";

export async function POST(req: Request, { id }: { id: string }) {
  try {
    const user = extractUser(req);
    if (!user)
      return Response.json({ message: "Unauthorized" }, { status: 401 });

    await connectDB();
    const snap = await Snap.findById(id);
    if (!snap)
      return Response.json({ message: "Snap not found" }, { status: 404 });

    const index = snap.likes.indexOf(user.id || user._id);
    if (index > -1) {
      snap.likes.splice(index, 1);
    } else {
      snap.likes.push(user.id || user._id);
    }

    await snap.save();
    return Response.json(snap);
  } catch (error: any) {
    console.error("Snap like error:", error);
    return Response.json(
      { message: "Error toggling like: " + error.message },
      { status: 500 },
    );
  }
}
