import { Response } from "express";
import { AuthRequest } from "../middleware/authMiddleware";
import {
  createTaskSchema,
  moveTaskSchema,
  updateTaskSchema,
} from "../schemas/taskSchema";
import { AppError } from "../utils/AppError";
import { prisma } from "../lib/prisma";

export const createTask = async (req: AuthRequest, res: Response) => {
  const parsed = createTaskSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new AppError(parsed.error.issues[0].message, 400);
  }

  const { title, description, dueDate, priority } = parsed.data;
  const projectId = req.params.projectId as string;

  const lastTask = await prisma.task.findFirst({
    where: { projectId, status: "TODO" },
    orderBy: { position: "desc" },
  });

  const newPosition = lastTask ? lastTask.position + 1 : 0;

  const task = await prisma.task.create({
    data: {
      title,
      description,
      dueDate,
      priority,
      projectId,
      position: newPosition,
      createdById: req.userId as string,
    },
  });

  res.status(201).json(task);
};

export const listTasks = async (req: AuthRequest, res: Response) => {
  const projectId = req.params.projectId as string;

  const tasks = await prisma.task.findMany({
    where: {
      projectId,
      isArchived: false,
    },
    orderBy: { position: "asc" },
    include: {
      assignees: {
        include: {
          user: { select: { id: true, email: true } },
        },
      },
      labels: {
        include: {
          label: true,
        },
      },
    },
  });

  res.json(tasks);
};

export const moveTask = async (req: AuthRequest, res: Response) => {
  const parsed = moveTaskSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new AppError(parsed.error.issues[0].message, 400);
  }

  const { status: newStatus, position: newPosition } = parsed.data;
  const taskId = req.params.taskId as string;

  const task = await prisma.task.findUnique({
    where: { id: taskId },
  });

  if (!task) {
    throw new AppError("Task not found", 404);
  }

  await prisma.$transaction([
    prisma.task.updateMany({
      where: {
        projectId: task.projectId,
        status: task.status,
        position: {
          gt: task.position,
        },
      },
      data: {
        position: {
          decrement: 1,
        },
      },
    }),

    prisma.task.updateMany({
      where: {
        projectId: task.projectId,
        status: newStatus,
        position: { gte: newPosition },
      },
      data: {
        position: {
          increment: 1,
        },
      },
    }),

    prisma.task.update({
      where: { id: taskId },
      data: { status: newStatus, position: newPosition },
    }),
  ]);

  res.json({ message: "Task moved successfully" });
};

export const assignUser = async (req: AuthRequest, res: Response) => {
  const taskId = req.params.taskId as string;
  const { userId } = req.body;

  if (!userId) {
    throw new AppError("User ID required", 400);
  }

  const existing = await prisma.taskAssignee.findUnique({
    where: { taskId_userId: { taskId, userId } },
  });

  if (existing) {
    throw new AppError("User already assigned", 409);
  }

  const assignment = await prisma.taskAssignee.create({
    data: { taskId, userId },
  });
  res.status(201).json(assignment);
};

export const unassignUser = async (req: AuthRequest, res: Response) => {
  const { taskId, userId } = req.params as { taskId: string; userId: string };

  await prisma.taskAssignee.delete({
    where: { taskId_userId: { taskId, userId } },
  });

  res.json({ message: "User unassigned successfully" });
};

export const updateTask = async (req: AuthRequest, res: Response) => {
  const parsed = updateTaskSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new AppError(parsed.error.issues[0].message, 400);
  }

  const { taskId } = req.params as { taskId: string };

  const task = await prisma.task.update({
    where: { id: taskId },
    data: parsed.data,
  });

  res.json(task);
};

export const archiveTask = async (req: AuthRequest, res: Response) => {
  const { taskId } = req.params as { taskId: string };

  await prisma.task.update({
    where: { id: taskId },
    data: { isArchived: true },
  });

  res.json({ message: "Task archived successfully" });
};
