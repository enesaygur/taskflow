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
