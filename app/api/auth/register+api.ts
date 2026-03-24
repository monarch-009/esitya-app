import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../../../lib/auth";
import connectDB from "../../../lib/db";
import User from "../../../models/User.js";

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return Response.json({ message: "Missing credentials" }, { status: 400 });
    }

    await connectDB();

    const allowedEmails = [
      "adityasinghmoni@gmail.com",
      "esitayadav2003@gmail.com",
    ];
    if (!allowedEmails.includes(email)) {
      return Response.json(
        { message: "Not authorized for this private app" },
        { status: 403 },
      );
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return Response.json({ message: "User already exists" }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: "admin", // Depending on your business logic, maybe esitayadav2003@gmail.com is not admin?
    });

    // Keep JWT payload minimal to avoid SecureStore size limits on Android
    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, {
      expiresIn: "30d",
    });

    return Response.json({
      token,
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        image: user.profileImage,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Register error", error);
    return Response.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
