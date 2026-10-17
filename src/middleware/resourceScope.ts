import { NextFunction, Response } from "express";
import { AuthRequest } from "./authMiddleware";
import { prisma } from "../lib/prisma";
import { AppError } from "../utils/AppError";

export const requireProjectInOrg = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  const project = await prisma.project.findFirst({
    where: {
      id: req.params.projectId as string,
    },
  });
  if (!project) throw new AppError("Project not found", 404);
  next();
};

export const requireTaskInProject = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  const task = await prisma.task.findFirst({
    where: {
      id: req.params.taskId as string,
      projectId: req.params.projectId as string,
    },
  });
  if (!task) throw new AppError("Task not found", 404);
  next();
};
