import z from "zod";

export const campaignZodSchema = z.object({
  name: z.string().min(2, "Campaign Name must be at least 2 characters long"),
  date_start: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid start date format"),
  date_end: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid end date format"),
});

export const campaignDefaultValues = {
  name: "",
  date_start: "",
  date_end: "",
};
