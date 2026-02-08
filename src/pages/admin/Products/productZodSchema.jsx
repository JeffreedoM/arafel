import z from "zod";

export const productZodSchema = z.object({
  product_name: z.string().min(1, "Product Name is required"),
  product_description: z.string().min(1, "Product Description is required"),
  stock: z.coerce.number().int("Stock must be a whole number").optional(),
  price: z.coerce.number().int("Price must be a whole number").optional(),
  price_description: z.coerce
    .number()
    .int("Price Description must be a whole number")
    .optional(),
});

export const productDefaultValues = {
  product_name: "",
  product_description: "",
  // stock: 0,
};
