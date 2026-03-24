import connectDB from "../../../lib/db";
import Bucket from "../../../models/Bucket.js";
import { extractUser } from "../../../lib/auth";

export async function PUT(req: Request, { id }: { id: string }) {
  try {
    const user = extractUser(req);
    // Allow admin or Esita to modify bucket items
    const canManage =
      user?.role === "admin" || user?.email === "esitayadav2003@gmail.com";
    if (!canManage)
      return Response.json({ message: "Unauthorized" }, { status: 401 });

    const data = await req.json();
    await connectDB();

    if (data.completed === true) {
      data.completedDate = new Date();
    } else if (data.completed === false) {
      data.completedDate = null;
    }

    const updatedItem = await Bucket.findByIdAndUpdate(id, data, { new: true });
    return Response.json(updatedItem);
  } catch (error) {
    return Response.json({ message: "Error" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { id }: { id: string }) {
  try {
    const user = extractUser(req);
    const canManage =
      user?.role === "admin" || user?.email === "esitayadav2003@gmail.com";
    if (!canManage)
      return Response.json({ message: "Unauthorized" }, { status: 401 });

    await connectDB();
    await Bucket.findByIdAndDelete(id);
    return Response.json({ message: "Deleted" });
  } catch (error) {
    return Response.json({ message: "Error" }, { status: 500 });
  }
}
