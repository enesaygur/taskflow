import { z } from "zod";

export const createInviteSchema = z.object({
  email: z.string().email("Geçerli bir email adresi giriniz"),
  role: z.enum(["ADMIN", "MEMBER"]).default("MEMBER"),
});
