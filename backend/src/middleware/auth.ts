import { Request, Response, NextFunction } from "express";
import { supabase } from "../config/supabase";
import User, { IUser } from "../models/User";

export interface AuthRequest extends Request {
  user?: IUser;
}

export const protect = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];

      // Check if supabase is configured
      if (!supabase) {
        return res
          .status(500)
          .json({ message: "Authentication service not configured" });
      }

      const {
        data: { user },
        error,
      } = await supabase.auth.getUser(token);

      if (error || !user) {
        console.error("Supabase Auth Error:", error?.message);
        return res
          .status(401)
          .json({
            message: "Not authorized, token failed",
            error: error?.message,
          });
      }

      // Sync or Fetch User from MongoDB
      let dbUser = await User.findOne({ supabaseId: user.id });

      if (!dbUser) {
        // Auto-create if not exists (Sync on fly)
        const userRole = user.user_metadata?.role || "investor";

        dbUser = await User.create({
          supabaseId: user.id,
          email: user.email,
          role: userRole,
          profile: {
            name: user.user_metadata?.full_name || "",
          },
          savedListings: [],
        });

        console.log(`Created new user in MongoDB with role: ${userRole}`);
      }

      req.user = dbUser;
      next();
    } catch (error) {
      console.error("Auth Middleware Exception:", error);
      res.status(401).json({ message: "Not authorized, token failed" });
    }
  } else {
    res.status(401).json({ message: "Not authorized, no token" });
  }
};

export const authorize = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `User role ${req.user?.role} is not authorized to access this route`,
      });
    }
    next();
  };
};
