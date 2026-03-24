import connectDB, { Letter } from "../../../lib/db";
import { extractUser } from "../../../lib/auth";

export async function GET(req: Request) {
  try {
    const user = extractUser(req) as any;
    if (!user)
      return Response.json({ message: "Unauthorized" }, { status: 401 });

    await connectDB();
    // In letters, we usually only see letters sent to or from us
    const letters = await Letter.find({
      $or: [{ senderId: user.id }, { receiverId: user.id }],
    }).sort({ createdAt: -1 });

    return Response.json(letters);
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

    const newLetter = await Letter.create({
      ...data,
      senderId: user.id,
      senderName: user.name,
      // Target is likely the only other user in the relationship app
      // For a 2 person app, we can auto-assign the receiver
    });

    return Response.json(newLetter, { status: 201 });
  } catch (error) {
    return Response.json({ message: "Error" }, { status: 500 });
  }
}
