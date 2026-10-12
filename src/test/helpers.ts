import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma";
import type { Plan, Role } from "@prisma/client";

export const resetDb = async () => {
  await prisma.$executeRawUnsafe(
    `TRUNCATE TABLE "TaskLabel", "TaskAssignee", "Label", "Task", "Project", "Invite", "OrganizationMember", "Organization", "RefreshToken", "User" CASCADE`,
  );
};

export const createUser = async (
  email: string,
  options?: { verified?: boolean; password?: string },
) => {
  const password = options?.password ?? "password123";
  return prisma.user.create({
    data: {
      email,
      password: await bcrypt.hash(password, 4),
      isEmailVerified: options?.verified ?? true,
    },
  });
};

export const tokenFor = (userId: string) =>
  jwt.sign({ userId }, process.env.JWT_SECRET as string, { expiresIn: "15m" });

export const createOrg = async (ownerId: string, plan: Plan = "FREE") =>
  prisma.organization.create({
    data: {
      name: "Test Org",
      plan,
      members: { create: { userId: ownerId, role: "OWNER" } },
    },
  });

export const addMember = (
  organizationId: string,
  userId: string,
  role: Role = "MEMBER",
) =>
  prisma.organizationMember.create({
    data: { organizationId, userId, role },
  });

export const bearer = (userId: string) => `Bearer ${tokenFor(userId)}`;

export const createProject = (
  organizationId: string,
  createdById: string,
  name = "Project",
) => prisma.project.create({ data: { name, organizationId, createdById } });

export const createTask = (
  projectId: string,
  createdById: string,
  title = "Task",
) => prisma.task.create({ data: { title, projectId, createdById } });