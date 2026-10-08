import { Response } from "express";
import { AuthRequest } from "../middleware/authMiddleware";
import { createInviteSchema } from "../schemas/inviteSchema";
import { AppError } from "../utils/AppError";
import crypto from "crypto";
import { prisma } from "../lib/prisma";
import { PLAN_LIMITS } from "../constants/plans";

export const createInvite = async (req: AuthRequest, res: Response) => {
  const parsed = createInviteSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new AppError(parsed.error.issues[0].message, 400);
  }

  const { email, role } = parsed.data;
  const organizationId = req.params.organizationId as string;

  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000);

  const invite = await prisma.invite.create({
    data: {
      email,
      role,
      organizationId,
      token,
      expiresAt,
      invitedById: req.userId as string,
    },
  });

  console.log(
    `Invite link: http://localhost:5173/invites/accept?token=${token}`,
  );
  res
    .status(201)
    .json({ message: "Invite sent successfully", inviteId: invite.id });
};

export const acceptInvite = async (req: AuthRequest, res: Response) => {
  const { token } = req.body;

  if (!token) {
    throw new AppError("Token required", 400);
  }

  const invite = await prisma.invite.findUnique({
    where: { token },
  });

  if (!invite || invite.accepted || invite.expiresAt < new Date()) {
    throw new AppError("Invalid or expired invite", 400);
  }

  const user = await prisma.user.findUnique({
    where: { id: req.userId },
  });

  if (user?.email !== invite.email) {
    throw new AppError(
      "This invite was sent to a different email address",
      403,
    );
  }

  const organization = await prisma.organization.findUnique({
    where: { id: invite.organizationId },
    include: { _count: { select: { members: true } } },
  });

  if (!organization) {
    throw new AppError("Organization not found", 404);
  }

  const limit = PLAN_LIMITS[organization.plan];
  if (organization._count.members >= limit) {
    throw new AppError(
      `Member limit reached for ${organization.plan} plan. Upgrade your plan to add more members`,
      403,
    );
  }

  await prisma.organizationMember.create({
    data: {
      organizationId: invite.organizationId,
      userId: req.userId as string,
      role: invite.role,
    },
  });

  await prisma.invite.update({
    where: { id: invite.id },
    data: { accepted: true },
  });

  res.json({ message: "Invite accepted successfully" });
};
