import connectDB from "../../../lib/db";
import User from "../../../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { JWT_SECRET } from "../../../lib/auth";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return Response.json({ message: "Missing credentials" }, { status: 400 });
    }

    await connectDB();

    const user = await User.findOne({ email });
    if (!user) {
      return Response.json({ message: "User not found" }, { status: 404 });
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return Response.json({ message: "Invalid credentials" }, { status: 401 });
    }

    const allowedEmails = [
      "adityasinghmoni@gmail.com",
      "esitayadav2003@gmail.com",
    ];
    if (!allowedEmails.includes(user.email)) {
      return Response.json(
        { message: "Not authorized for this private app" },
        { status: 403 },
      );
    }

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
    console.error("Login error", error);
    return Response.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
