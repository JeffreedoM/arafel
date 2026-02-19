import z from "zod";

export const productZodSchema = z.object({
  product_name: z.string().min(1, "Product Name is required"),
  product_description: z.string().min(1, "Product Description is required"),
  stock: z.coerce.number().int("Stock must be a whole number").optional(),
  price: z.coerce.number().int("Price must be a whole number").optional(),
  price_description: z
    .string()
    .min(1, "Price Description is required")
    .optional(),
  category_id: z.coerce
    .number({
      required_error: "Category is required",
      invalid_type_error: "Category is required",
    })
    .int()
    .positive("Category is required"),
});

export const productDefaultValues = {
  product_name: "",
  product_description: "",
  category_id: undefined,
  // image: z.any().optional(), // Ensure this is not z.string()
  // stock: 0,
};
