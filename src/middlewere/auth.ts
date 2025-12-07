import config from "../config/index";
import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

const auth = (...roles: string[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized - No token provided",
        });
      }

      const token = authHeader.split(" ")[1];

      const decoded = jwt.verify(
        token as string,
        config.jwt_Secreat as string
      ) as JwtPayload;

      req.user = decoded;

      if (roles.length && !roles.includes(decoded.role as string)) {
        return res.status(403).json({
          success: false,
          message: "Forbidden - You are not allowed to access this resource",
        });
      }

      next();
    } catch (err: any) {
      return res.status(401).json({
        success: false,
        message: err.message || "Invalid token",
      });
    }
  };
};

export default auth;
