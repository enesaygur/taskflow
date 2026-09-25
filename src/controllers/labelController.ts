import { Response } from "express";
import { AuthRequest } from "../middleware/authMiddleware";
import { createLabelSchema } from "../schemas/labelSchema";
import { AppError } from "../utils/AppError";
import { prisma } from "../lib/prisma";

export const createLabel = async (req: AuthRequest, res: Response) => {
  const parsed = createLabelSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new AppError(parsed.error.issues[0].message, 400);
  }

  const { name, color } = parsed.data;
  const projectId = req.params.projectId as string;

  const label = await prisma.label.create({
    data: { name, color, projectId },
  });

  res.status(201).json(label);
};

export const listLabels = async (req: AuthRequest, res: Response) => {
  const projectId = req.params.projectId as string;

  const labels = await prisma.label.findMany({
    where: { projectId },
  });

  res.json(labels);
};

export const addLabelToTask = async (req: AuthRequest, res: Response) => {
  const { taskId } = req.params as { taskId: string };
  const { labelId } = req.body;

  if (!labelId) {
    throw new AppError("Label ID required", 400);
  }

  const taskLabel = await prisma.taskLabel.create({
    data: {
      taskId,
      labelId,
    },
  });

  res.status(201).json(taskLabel);
};

export const removeLabelFromTask = async (req: AuthRequest, res: Response) => {
  const { taskId, labelId } = req.params as { taskId: string; labelId: string };

  await prisma.taskLabel.delete({
    where: { taskId_labelId: { taskId, labelId } },
  });

  res.json({ message: "Label deleted successfully" });
};
