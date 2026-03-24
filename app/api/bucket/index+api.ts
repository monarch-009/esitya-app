import connectDB, { Bucket } from "../../../lib/db";
import { extractUser } from "../../../lib/auth";

export async function GET(req: Request) {
  try {
    const user = extractUser(req);
    if (!user)
      return Response.json({ message: "Unauthorized" }, { status: 401 });
    await connectDB();
    if (require("mongoose").connection.readyState !== 1) {
      await new Promise((r) => setTimeout(r, 500));
    }
    const items = await Bucket.find().sort({ createdAt: -1 });
    const stats = {
      total: items.length,
      completed: items.filter((i: any) => i.completed).length,
    };
    return Response.json({ items, stats });
  } catch (error) {
    return Response.json({ message: "Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = extractUser(req) as any;
    if (!user)
      return Response.json({ message: "Unauthorized" }, { status: 401 });
    const data = await req.json();
    await connectDB();

    const newItem = await Bucket.create({
      ...data,
      createdBy: user.id,
    });

    return Response.json(newItem, { status: 201 });
  } catch (error) {
    return Response.json({ message: "Error" }, { status: 500 });
  }
}
