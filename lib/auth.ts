import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import path from "path";

// Ensure env is loaded before export evaluation
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

export const JWT_SECRET =
  process.env.JWT_SECRET ||
  "changeme_to_a_random_secret_string_at_least_32_chars";

export const extractUser = (req: Request) => {
  const authHeader = req.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    console.error("DEBUG: Missing or invalid Authorization header");
    return null;
  }
  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    return decoded;
  } catch (e: any) {
    console.error("DEBUG: JWT Verification failed:", e.message);
    return null;
  }
};
