import { Response } from "express";
import { prisma } from "../lib/prisma";
import { AuthRequest } from "../middleware/authMiddleware";
import { createOrganizationSchema } from "../schemas/organizationSchema";
import { AppError } from "../utils/AppError";

export const createOrganization = async (req: AuthRequest, res: Response) => {
  const parsed = createOrganizationSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new AppError(parsed.error.issues[0].message, 400);
  }

  const { name } = parsed.data;
  const organization = await prisma.organization.create({
    data: {
      name,
      members: {
        create: {
          userId: req.userId as string,
          role: "OWNER",
        },
      },
    },
    include: {
      members: true,
    },
  });

  res.status(201).json(organization);
};

export const listMyOrganizations = async (req: AuthRequest, res: Response) => {
  const membership = await prisma.organizationMember.findMany({
    where: { userId: req.userId as string },
    include: {
      organization: true,
    },
  });

  const organizations = membership.map((m) => ({
    ...m.organization,
    myRole: m.role,
  }));

  res.json(organizations);
};

export const listMembers = async (req: AuthRequest, res: Response) => {
  const organizationId = req.params.organizationId as string;

  const members = await prisma.organizationMember.findMany({
    where: { organizationId },
    include: {
      user: { select: { id: true, email: true } },
    },
  });

  res.json(members);
};

export const getOrganization = async (req: AuthRequest, res: Response) => {
  const organizationId = req.params.organizationId as string;

  const organization = await prisma.organization.findUnique({
    where: { id: organizationId },
  });

  if (!organization) {
    throw new AppError("Organization not found", 404);
  }

  res.json(organization);
};
