import { NextFunction, Response } from "express";
import { AuthRequest } from "./authMiddleware";
import { prisma } from "../lib/prisma";
import { AppError } from "../utils/AppError";

export const requireRole = (allowedRoles: string[]) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    const organizationId = req.params.organizationId as string;

    const membership = await prisma.organizationMember.findUnique({
      where: {
        organizationId_userId: {
          organizationId,
          userId: req.userId as string,
        },
      },
    });

    if (!membership) {
      throw new AppError("Not a member of this organization", 403);
    }

    if (!allowedRoles.includes(membership.role)) {
      throw new AppError("Insufficient permissions", 403);
    }

    next();
  };
};
