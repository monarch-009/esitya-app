import connectDB, { Snap, User } from "../../../lib/db";
import { extractUser } from "../../../lib/auth";

export async function DELETE(req: Request, { id }: { id: string }) {
  try {
    const user = extractUser(req);
    if (!user)
      return Response.json({ message: "Unauthorized" }, { status: 401 });

    await connectDB();
    const snap = await Snap.findById(id);
    if (!snap)
      return Response.json({ message: "Snap not found" }, { status: 404 });

    // Restrict deletes to original author or admin
    if (user.role !== "admin" && user.id !== snap.author?.toString()) {
      return Response.json({ message: "Forbidden" }, { status: 403 });
    }

    await Snap.findByIdAndDelete(id);
    return Response.json({ message: "Deleted" });
  } catch (error: any) {
    console.error("Snap delete error:", error);
    return Response.json(
      { message: "Error deleting snap: " + error.message },
      { status: 500 },
    );
  }
}
