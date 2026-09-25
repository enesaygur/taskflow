import { z } from "zod";

export const createLabelSchema = z.object({
  name: z.string().min(1, "Label name is required"),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Geçerli bir hex renk kodu girin (örn: #FF5733)"),
});
