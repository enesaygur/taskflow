import { Request, Response } from "express";
import { loginSchema, registerSchema } from "../schemas/authSchema";
import { AppError } from "../utils/AppError";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { prisma } from "../lib/prisma";
import jwt from "jsonwebtoken";
import { AuthRequest } from "../middleware/authMiddleware";

export const register = async (req: Request, res: Response) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new AppError(parsed.error.issues[0].message, 400);
  }

  const { email, password } = parsed.data;

  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw new AppError("User already exists", 409);
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const verificationToken = crypto.randomBytes(32).toString("hex");
  const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

  await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      emailVerificationToken: verificationToken,
      emailVerificationExpires: verificationExpires,
    },
  });
  console.log(
    `Verification link: http://localhost:3000/auth/verify-email?token=${verificationToken}`,
  );
  res.status(201).json({ message: "Kayıt başarılı, e-postanızı doğrulayın" });
};

export const login = async (req: Request, res: Response) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new AppError(parsed.error.issues[0].message, 400);
  }

  const { email, password } = parsed.data;

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new AppError("Invalid credentials", 401);
  }

  const passwordMatch = await bcrypt.compare(password, user.password);

  if (!passwordMatch) {
    throw new AppError("Invalid credentials", 401);
  }

  if (!user.isEmailVerified) {
    throw new AppError("Please verify your email before logging in", 403);
  }

  const accessToken = jwt.sign(
    { userId: user.id },
    process.env.JWT_SECRET as string,
    { expiresIn: "15m" },
  );

  const refreshTokenPlain = crypto.randomBytes(40).toString("hex");
  const refreshTokenHash = await bcrypt.hash(refreshTokenPlain, 10);

  await prisma.refreshToken.create({
    data: {
      tokenHash: refreshTokenHash,
      userId: user.id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });
  res.cookie("refreshToken", refreshTokenPlain, {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
  res.json({ accessToken });
};

export const refresh = async (req: Request, res: Response) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    throw new AppError("Refresh token required", 400);
  }

  const storedTokens = await prisma.refreshToken.findMany({
    where: { revoked: false, expiresAt: { gt: new Date() } },
  });

  let matchedToken = null;
  for (const t of storedTokens) {
    const isMatch = await bcrypt.compare(refreshToken, t.tokenHash);
    if (isMatch) {
      matchedToken = t;
      break;
    }
  }

  if (!matchedToken) {
    throw new AppError("Invalid or expired refresh token", 401);
  }

  await prisma.refreshToken.update({
    where: { id: matchedToken.id },
    data: { revoked: true },
  });

  const newAccessToken = jwt.sign(
    { userId: matchedToken.userId },
    process.env.JWT_SECRET as string,
    { expiresIn: "15m" },
  );

  const newRefreshTokenPlain = crypto.randomBytes(40).toString("hex");
  const newRefreshTokenHash = await bcrypt.hash(newRefreshTokenPlain, 10);

  await prisma.refreshToken.create({
    data: {
      tokenHash: newRefreshTokenHash,
      userId: matchedToken.userId,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });
  res.cookie("refreshToken", newRefreshTokenPlain, {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
  res.json({ accessToken: newAccessToken });
};

export const verifyEmail = async (req: Request, res: Response) => {
  const { token } = req.query;

  if (!token || typeof token !== "string") {
    throw new AppError("Token required", 400);
  }

  const user = await prisma.user.findFirst({
    where: {
      emailVerificationToken: token,
      emailVerificationExpires: { gt: new Date() },
    },
  });

  if (!user) {
    throw new AppError("Invalid or expired verification token", 400);
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      isEmailVerified: true,
      emailVerificationToken: null,
      emailVerificationExpires: null,
    },
  });
  res.json({ message: "Email verified successfully" });
};

export const logout = async (req: Request, res: Response) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    throw new AppError("Refresh token required", 400);
  }

  const storedTokens = await prisma.refreshToken.findMany({
    where: { revoked: false },
  });

  for (const t of storedTokens) {
    const isMatch = await bcrypt.compare(refreshToken, t.tokenHash);
    if (isMatch) {
      await prisma.refreshToken.update({
        where: { id: t.id },
        data: { revoked: true },
      });
      break;
    }
  }
  res.clearCookie("refreshToken");
  res.json({ message: "Logged out successfully" });
};

export const getMe = async (req: AuthRequest, res: Response) => {
  const user = await prisma.user.findUnique({
    where: { id: req.userId },
    select: { id: true, email: true },
  });

  res.json(user);
};
