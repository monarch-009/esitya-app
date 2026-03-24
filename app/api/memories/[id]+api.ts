import connectDB from "../../../lib/db";
import Memory from "../../../models/Memory.js";
import { extractUser } from "../../../lib/auth";

export async function PUT(req: Request, { id }: { id: string }) {
  try {
    const user = extractUser(req);
    if (!user || user.role !== "admin")
      return Response.json({ message: "Unauthorized" }, { status: 401 });

    const data = await req.json();
    await connectDB();
    const updated = await Memory.findByIdAndUpdate(id, data, { new: true });
    return Response.json(updated);
  } catch (error) {
    return Response.json({ message: "Error" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { id }: { id: string }) {
  try {
    const user = extractUser(req);
    if (!user || user.role !== "admin")
      return Response.json({ message: "Unauthorized" }, { status: 401 });

    await connectDB();
    await Memory.findByIdAndDelete(id);
    return Response.json({ message: "Deleted" });
  } catch (error) {
    return Response.json({ message: "Error" }, { status: 500 });
  }
}
