import type { CookieOptions } from "express";
import { IS_PRODUCTION } from "./env";

const base: CookieOptions = {
  httpOnly: true,
  secure: IS_PRODUCTION,
  sameSite: IS_PRODUCTION ? "none" : "lax",
};

export const refreshCookieOptions: CookieOptions = {
  ...base,
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

export const clearRefreshCookieOptions: CookieOptions = base;