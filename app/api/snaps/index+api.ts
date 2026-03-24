import connectDB, { Snap, User } from "../../../lib/db";
import { extractUser } from "../../../lib/auth";

export async function GET(req: Request) {
  try {
    const user = extractUser(req) as any;
    if (!user)
      return Response.json({ message: "Unauthorized" }, { status: 401 });

    await connectDB();
    const snaps = await Snap.find()
      .populate({
        path: "author",
        model: User,
        select: "name profileImage email",
      })
      .populate({
        path: "comments.author",
        model: User,
        select: "name profileImage email",
      })
      .sort({ createdAt: -1 })
      .limit(200);

    return Response.json(snaps);
  } catch (error) {
    console.error("Snaps fetch error", error);
    return Response.json({ message: "Error fetching snaps" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = extractUser(req) as any;
    if (!user)
      return Response.json({ message: "Unauthorized" }, { status: 401 });

    const { caption, mediaUrl, platform, mediaType, isMirrored } =
      await req.json();
    await connectDB();

    const newSnap = await Snap.create({
      caption,
      mediaUrl,
      platform,
      mediaType,
      isMirrored: !!isMirrored,
      author: user.id,
    });

    const populatedSnap = await Snap.findById(newSnap._id).populate({
      path: "author",
      model: User,
      select: "name profileImage email",
    });

    // We can add push notification server logic later if needed or call central NextJS backend.

    return Response.json(populatedSnap, { status: 201 });
  } catch (error) {
    console.error("Snap create error", error);
    return Response.json({ message: "Error creating snap" }, { status: 500 });
  }
}
