import connectDB, { Memory } from "../../../lib/db";
import { extractUser } from "../../../lib/auth";

export async function GET(req: Request) {
  try {
    const user = extractUser(req) as any;
    if (!user)
      return Response.json({ message: "Unauthorized" }, { status: 401 });

    await connectDB();
    const memories = await Memory.find().sort({ date: 1 });
    return Response.json(memories);
  } catch (error) {
    return Response.json({ message: "Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = extractUser(req) as any;
    if (!user || user.role !== "admin")
      return Response.json({ message: "Unauthorized" }, { status: 401 });

    const data = await req.json();
    await connectDB();

    const newMemory = await Memory.create({
      ...data,
      createdBy: user.id,
    });

    return Response.json(newMemory, { status: 201 });
  } catch (error: any) {
    console.error("Memory creation error:", error);
    return Response.json(
      {
        message:
          "Memory creation failed: " + (error.message || "Unknown error"),
      },
      { status: 500 },
    );
  }
}
