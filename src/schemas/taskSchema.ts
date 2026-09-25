import { z } from "zod";

export const createTaskSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  dueDate: z.coerce.date().optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]).default("MEDIUM"),
});

export const moveTaskSchema = z.object({
  status: z.enum(["TODO", "IN_PROGRESS", "DONE"]),
  position: z.number().int().min(0),
});

export const updateTaskSchema = createTaskSchema.partial();
