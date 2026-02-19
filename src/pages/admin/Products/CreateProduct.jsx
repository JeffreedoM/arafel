import { SiteHeader } from "@/components/site-header";
import { supabase } from "@/lib/supabase-client";

// forms
import { get, useForm } from "react-hook-form";
import z from "zod";
import { productDefaultValues, productZodSchema } from "./productZodSchema";
import { zodResolver } from "@hookform/resolvers/zod";

// shadcn
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { useEffect, useState } from "react";
import AddCategory from "./AddCategory";

export default function CreateProduct() {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(productZodSchema),
    defaultValues: productDefaultValues,
  });

  const [openCategories, setOpenCategories] = useState(false);

  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categories, setCategories] = useState([]);

  // console.log(watch("product_name")); // watch input value by passing the name of it

  /*
   * Thumbnail Image handling
   */
  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [imageError, setImageError] = useState(null);

  useEffect(() => {
    if (!imageFile) {
      setPreviewUrl(null);
      return;
    }

    const url = URL.createObjectURL(imageFile);
    setPreviewUrl(url);

    return () => URL.revokeObjectURL(url);
  }, [imageFile]);

  const uploadImage = async (file) => {
    const fileExt = file.name.split(".").pop();
    const fileName = `${crypto.randomUUID()}.${fileExt}`;
    const filePath = `products/${fileName}`;

    const { error } = await supabase.storage
      .from("product-images")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (error) throw error;

    return filePath;
  };

  const onSubmit = async (formData) => {
    try {
      if (!imageFile) {
        setImageError("Product image is required.");
        return;
      }

      if (imageError) return;

      // 1️⃣ Create product
      const { data: newProduct, error: productError } = await supabase
        .from("products")
        .insert([formData])
        .select()
        .single();

      if (productError) throw productError;

      // 2️⃣ Upload image
      const imageURL = await uploadImage(imageFile);

      const { error: imageInsertError } = await supabase
        .from("product_images")
        .insert({
          product_id: newProduct.id,
          image_url: imageURL,
          is_thumbnail: true,
        });

      if (imageInsertError) throw imageInsertError;

      // 3️⃣ Upload gallery images (if any)
      for (let i = 0; i < galleryFiles.length; i++) {
        const path = await uploadFile(galleryFiles[i]);
        await supabase.from("product_images").insert({
          product_id: newProduct.id,
          image_url: path,
          is_thumbnail: false,
          order: i + 1, // after thumbnail
        });
      }

      alert("Success!");
    } catch (err) {
      console.error("Submit Error:", err);
    }
  };

  /*
   *  End of thumbnailimage handling
   */

  /*
   * Gallery Image handling
   */

  const [galleryFiles, setGalleryFiles] = useState([]);
  const [galleryPreviews, setGalleryPreviews] = useState([]);
  const [galleryErrors, setGalleryErrors] = useState([]);

  const uploadFile = async (file) => {
    const ext = file.name.split(".").pop();
    const fileName = `${crypto.randomUUID()}.${ext}`;
    const filePath = `products/${fileName}`;

    const { error } = await supabase.storage
      .from("product-images")
      .upload(filePath, file);

    if (error) throw error;
    return filePath;
  };

  /*
   * End of Gallery Image handling
   */

  // fetch categories
  const fetchCategories = async () => {
    const { data, error } = await supabase
      .from("product_categories")
      .select("id, category_name")
      .order("category_name", { ascending: true });

    if (error) {
      console.error("Error fetching categories:", error.message);
      return [];
    }

    return data;
  };

  useEffect(() => {
    fetchCategories().then(setCategories);
  }, []);

  return (
    <>
      <SiteHeader title="Create Product" />
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="container mx-auto py-10">
            <Card className="mx-auto w-full max-w-6xl">
              <CardHeader>
                <CardTitle>Create Product</CardTitle>
                <CardDescription>
                  Fill out the form below to create a new product.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form
                  onSubmit={handleSubmit(onSubmit, (errors) =>
                    console.log("Validation Errors:", errors),
                  )}
                  className="flex flex-col"
                >
                  <div className="grid w-full gap-6 lg:grid-cols-2">
                    <FieldGroup className="lg:order-2">
                      <Field>
                        <FieldLabel htmlFor="product_name">
                          Product Name
                        </FieldLabel>
                        <Input
                          id="product_name"
                          {...register("product_name")}
                        />
                        {errors.product_name && (
                          <span className="-mt-1 text-sm font-semibold text-red-500">
                            {errors.product_name.message}
                          </span>
                        )}
                      </Field>

                      <Field>
                        <FieldLabel htmlFor="product_description">
                          Product Description
                        </FieldLabel>
                        <Input
                          id="product_description"
                          {...register("product_description")}
                        />
                        {errors.product_description && (
                          <span className="-mt-1 text-sm font-semibold text-red-500">
                            {errors.product_description.message}
                          </span>
                        )}
                      </Field>

                      <Field>
                        <FieldLabel htmlFor="stock">Stock</FieldLabel>
                        <Input
                          type="number"
                          min="0"
                          id="stock"
                          {...register("stock")}
                        />
                        {errors.stock && (
                          <span className="-mt-1 text-sm font-semibold text-red-500">
                            {errors.stock.message}
                          </span>
                        )}
                      </Field>

                      <Field>
                        <FieldLabel htmlFor="price">Price</FieldLabel>
                        <Input
                          type="number"
                          min="0"
                          id="price"
                          {...register("price")}
                        />
                        {errors.price && (
                          <span className="-mt-1 text-sm font-semibold text-red-500">
                            {errors.price.message}
                          </span>
                        )}
                      </Field>

                      <Field>
                        <FieldLabel htmlFor="price_description">
                          Price Description
                        </FieldLabel>
                        <Textarea
                          id="price_description"
                          {...register("price_description")}
                        />
                        {errors.price_description && (
                          <span className="-mt-1 text-sm font-semibold text-red-500">
                            {errors.price_description.message}
                          </span>
                        )}
                      </Field>

                      {/* <AddCategory /> */}
                      <AddCategory
                        categories={categories}
                        setCategories={setCategories}
                        selectedCategory={selectedCategory}
                        onSelectCategory={(id) => {
                          setSelectedCategory(id);
                          setValue("category_id", id, {
                            shouldValidate: true,
                            shouldDirty: true,
                          });
                        }}
                        error={errors.category_id}
                      />

                      <input
                        type="hidden"
                        {...register("category_id")}
                        id="category_id"
                      />
                    </FieldGroup>

                    <FieldGroup>
                      {/* Thumbnail */}
                      <Field>
                        <FieldLabel>Product Image (Thumbnail)</FieldLabel>
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;

                            // reset
                            setImageError(null);

                            // validate existence
                            if (!file) {
                              setImageError("Product image is required.");
                              setImageFile(null);
                              return;
                            }

                            // validate type
                            if (!file.type.startsWith("image/")) {
                              setImageError(
                                "Please select a valid image file.",
                              );
                              return;
                            }

                            // validate size
                            if (file.size > MAX_FILE_SIZE) {
                              setImageError("Image must be 5MB or smaller.");
                              return;
                            }

                            setImageFile(file);
                          }}
                        />
                        <FieldDescription>
                          Upload the product’s thumbnail image. Max size: 5MB.
                        </FieldDescription>
                        {imageError && (
                          <p className="-mt-1 text-sm font-semibold text-red-500">
                            {imageError}
                          </p>
                        )}

                        {previewUrl && !imageError && (
                          <img
                            src={previewUrl}
                            alt="Preview"
                            className="mt-2 h-32 w-32 rounded-md border object-cover"
                          />
                        )}
                      </Field>

                      {/* Gallery: upto 4 images */}
                      <Field>
                        <FieldLabel>Gallery Images</FieldLabel>

                        <Input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={(e) => {
                            const files = Array.from(e.target.files ?? []);

                            const validFiles = [];
                            const errors = [];

                            files.slice(0, 4).forEach((file, i) => {
                              if (!file.type.startsWith("image/")) {
                                errors.push(
                                  `File ${file.name} is not a valid image.`,
                                );
                              } else if (file.size > MAX_FILE_SIZE) {
                                errors.push(`File ${file.name} exceeds 5MB.`);
                              } else {
                                validFiles.push(file);
                              }
                            });

                            setGalleryFiles(validFiles);
                            setGalleryErrors(errors);

                            // generate previews
                            const previews = validFiles.map((file) =>
                              URL.createObjectURL(file),
                            );
                            setGalleryPreviews(previews);
                          }}
                        />
                        <FieldDescription>
                          Upload up to 4 images (max 5MB each).
                        </FieldDescription>

                        {galleryErrors.length > 0 && (
                          <div className="mt-1 text-sm text-red-500">
                            {galleryErrors.map((err, i) => (
                              <p key={i}>{err}</p>
                            ))}
                          </div>
                        )}

                        <div className="mt-2 flex flex-wrap gap-2">
                          {galleryPreviews.map((src, i) => (
                            <img
                              key={i}
                              src={src}
                              alt={`Gallery preview ${i + 1}`}
                              className="h-24 w-24 rounded-md border object-cover"
                            />
                          ))}
                        </div>
                      </Field>
                    </FieldGroup>
                  </div>

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="ml-auto cursor-pointer mt-5"
                  >
                    {isSubmitting ? "Submitting..." : "Submit"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
