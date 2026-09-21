import { Response } from "express";
import { AuthRequest } from "../middleware/authMiddleware";
import { createProjectSchema } from "../schemas/projectSchema";
import { AppError } from "../utils/AppError";
import { prisma } from "../lib/prisma";

export const createProject = async (req: AuthRequest, res: Response) => {
  const parsed = createProjectSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new AppError(parsed.error.issues[0].message, 400);
  }

  const { name } = parsed.data;
  const organizationId = req.params.organizationId as string;
  const createdById = req.userId as string;

  const project = await prisma.project.create({
    data: { name, organizationId, createdById },
  });

  res.status(201).json(project);
};

export const listProjects = async (req: AuthRequest, res: Response) => {
  const organizationId = req.params.organizationId as string;

  const projects = await prisma.project.findMany({
    where: { organizationId },
    orderBy: { createdAt: "desc" },
  });
  res.json(projects);
};
