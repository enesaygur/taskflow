const isProduction = process.env.NODE_ENV === "production";

if (isProduction && !process.env.FRONTEND_URL) {
  throw new Error("FRONTEND_URL is required in production");
}

export const IS_PRODUCTION = isProduction;
export const FRONTEND_URL = process.env.FRONTEND_URL ?? "http://localhost:5173";
