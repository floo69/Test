import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface AuthRequest extends Request {
  user?: Express.User;
}

export const authenticateStudent = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.replace("Bearer ", "");

    if (!token) {
      res.status(401).json({ error: "Authentication required" });
      return;
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "fallback_secret"
    );
    req.user = decoded as Express.User;

    if (req.user.role !== "student") {
      res.status(403).json({ error: "Access denied" });
      return;
    }

    next();
  } catch (error) {
    res.status(401).json({ error: "Invalid token" });
    return;
  }
};
