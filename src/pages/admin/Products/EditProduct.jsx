import { SiteHeader } from "@/components/site-header";
import { supabase } from "@/lib/supabase-client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { productDefaultValues, productZodSchema } from "./productZodSchema";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";

// shadcn components
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
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

import AddCategory from "./AddCategory";

export default function EditProduct() {
  const { id } = useParams();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm({
    resolver: zodResolver(productZodSchema),
    defaultValues: productDefaultValues,
  });

  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);

  const [existingThumbnail, setExistingThumbnail] = useState(null);
  const [newThumbnail, setNewThumbnail] = useState(null);

  const MAX_FILE_SIZE = 5 * 1024 * 1024;

  /*
   * Fetch product + categories
   */
  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      const { data, error } = await supabase
        .from("products")
        .select(
          `
      *,
      product_images (
        id,
        image_url,
        is_thumbnail
      )
    `,
        )
        .eq("id", id)
        .single();

      if (error) {
        console.error(error);
        return;
      }

      // 🔥 THIS replaces your setValue loop
      reset({
        ...data,
      });

      setSelectedCategory(data.category_id);

      const thumbnail = data.product_images.find((img) => img.is_thumbnail);

      if (thumbnail) {
        setExistingThumbnail(thumbnail);
      }
    };

    const fetchCategories = async () => {
      const { data } = await supabase
        .from("product_categories")
        .select("id, category_name")
        .order("category_name");

      setCategories(data || []);
    };

    fetchData();
    fetchCategories();
  }, [id, setValue]);

  /*
   * Upload helper
   */
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
   * Gallery Images Handling
   */
  // existing gallery images (from DB)
  const [existingGallery, setExistingGallery] = useState([]); // { id, image_url }

  // track which existing images the user wants to delete
  const [existingGalleryToDelete, setExistingGalleryToDelete] = useState([]);

  // new gallery files the user adds
  const [newGalleryFiles, setNewGalleryFiles] = useState([]);

  // Fetch existing gallery after fetching product
  useEffect(() => {
    if (!id) return;
    const fetchGallery = async () => {
      const { data, error } = await supabase
        .from("product_images")
        .select("id, image_url")
        .eq("product_id", id)
        .eq("is_thumbnail", false)
        .order("order", { ascending: true });

      if (!error && data) setExistingGallery(data);
    };
    fetchGallery();
  }, [id]);

  // Handle new uploads
  const handleGalleryChange = (e) => {
    const files = Array.from(e.target.files ?? []);
    const validFiles = [];

    files.slice(0, MAX_GALLERY - existingGallery.length).forEach((file) => {
      if (!file.type.startsWith("image/")) return;
      if (file.size > MAX_FILE_SIZE) return;
      validFiles.push(file);
    });

    setNewGalleryFiles(validFiles);
  };

  // Remove existing gallery image
  const removeExistingGallery = (idToRemove) => {
    setExistingGallery(existingGallery.filter((img) => img.id !== idToRemove));
  };

  // Remove newly added image
  const removeNewGalleryFile = (index) => {
    setNewGalleryFiles(newGalleryFiles.filter((_, i) => i !== index));
  };

  /*
   * Submit handler
   */
  const onSubmit = async (formData) => {
    try {
      // 1️⃣ Update product fields
      const { error } = await supabase
        .from("products")
        .update(formData)
        .eq("id", id);
      if (error) throw error;

      // 2️⃣ Handle thumbnail replacement
      if (newThumbnail) {
        const newPath = await uploadFile(newThumbnail);

        // delete old thumbnail from storage
        if (existingThumbnail) {
          await supabase.storage
            .from("product-images")
            .remove([existingThumbnail.image_url]);

          // delete from DB
          await supabase
            .from("product_images")
            .delete()
            .eq("id", existingThumbnail.id);
        }

        // insert new thumbnail
        await supabase.from("product_images").insert({
          product_id: id,
          image_url: newPath,
          is_thumbnail: true,
        });
      }

      // 3️⃣ Delete removed existing gallery images from DB and storage
      for (let img of existingGalleryToDelete) {
        // delete from storage
        await supabase.storage.from("product-images").remove([img.image_url]);

        console.log("Deleted from storage:", img.image_url);

        // delete from DB
        await supabase.from("product_images").delete().eq("id", img.id);
      }

      // 4️⃣ Upload new gallery files
      for (let i = 0; i < newGalleryFiles.length; i++) {
        const file = newGalleryFiles[i];
        const path = await uploadFile(file);

        await supabase.from("product_images").insert({
          product_id: id,
          image_url: path,
          is_thumbnail: false,
          order: existingGallery.length + i + 1,
        });
      }

      alert("Product updated successfully!");
    } catch (err) {
      console.error("Update error:", err);
    }
  };

  console.log({
    isDirty,
    newThumbnail,
    existingGalleryToDelete,
    newGalleryFiles,
  });

  return (
    <>
      <SiteHeader title="Edit Product" />

      <div className="container mx-auto py-10">
        <Card className="mx-auto w-full max-w-4xl">
          <CardHeader>
            <CardTitle>Edit Product</CardTitle>
            <CardDescription>Update product information below.</CardDescription>
          </CardHeader>

          <CardContent>
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="flex flex-col gap-6"
            >
              <FieldGroup>
                <Field>
                  <FieldLabel>Product Name</FieldLabel>
                  <Input {...register("product_name")} />
                  {errors.product_name && (
                    <p className="text-sm text-red-500">
                      {errors.product_name.message}
                    </p>
                  )}
                </Field>

                <Field>
                  <FieldLabel>Description</FieldLabel>
                  <Textarea {...register("product_description")} />
                </Field>

                <Field>
                  <FieldLabel>Stock</FieldLabel>
                  <Input type="number" {...register("stock")} />
                </Field>

                <Field>
                  <FieldLabel>Price</FieldLabel>
                  <Input type="number" {...register("price")} />
                </Field>

                <Field>
                  <FieldLabel>Price Description</FieldLabel>
                  <Input type="text" {...register("price_description")} />
                  {errors.price_description && (
                    <p className="text-sm text-red-500">
                      {errors.price_description.message}
                    </p>
                  )}
                </Field>

                <AddCategory
                  categories={categories}
                  selectedCategory={selectedCategory}
                  onSelectCategory={(id) => {
                    setSelectedCategory(id);
                    setValue("category_id", id);
                  }}
                />

                {/* Thumbnail */}
                <Field>
                  <FieldLabel>Thumbnail</FieldLabel>

                  <div className="bg-accent">
                    {existingThumbnail && !newThumbnail && (
                      <img
                        src={`${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/product-images/${existingThumbnail.image_url}`}
                        className="mx-auto mb-2 h-100 rounded-md border object-cover"
                      />
                    )}
                  </div>

                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;

                      if (
                        !file.type.startsWith("image/") ||
                        file.size > MAX_FILE_SIZE
                      ) {
                        alert("Invalid image file.");
                        return;
                      }

                      setNewThumbnail(file);
                    }}
                  />
                  <FieldDescription>
                    Leave empty to keep existing image.
                  </FieldDescription>
                </Field>

                <Field>
                  <FieldLabel>Gallery Images</FieldLabel>

                  <div className="bg-accent mb-2 flex w-full flex-wrap justify-center gap-2 gap-x-4">
                    {/* Existing gallery */}
                    {existingGallery.map((img) => (
                      <div key={img.id} className="relative">
                        <img
                          src={`${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/product-images/${img.image_url}`}
                          className="h-50 w-50 rounded-md border object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setExistingGalleryToDelete([
                              ...existingGalleryToDelete,
                              img,
                            ]);
                            setExistingGallery(
                              existingGallery.filter((e) => e.id !== img.id),
                            );
                          }}
                          className="bg-destructive white absolute -top-2 -right-2 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-white transition-transform hover:scale-110"
                        >
                          ×
                        </button>
                      </div>
                    ))}

                    {/* New uploads */}
                    {newGalleryFiles.map((file, i) => (
                      <div key={i} className="relative">
                        <img
                          src={URL.createObjectURL(file)}
                          className="h-50 w-50 rounded-md border object-cover"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setNewGalleryFiles(
                              newGalleryFiles.filter((_, index) => index !== i),
                            )
                          }
                          className="bg-destructive absolute -top-2 -right-2 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-white transition-transform hover:scale-110"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>

                  <Input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => {
                      const files = Array.from(e.target.files ?? []);

                      // how many slots are available
                      const remainingSlots =
                        4 - existingGallery.length - newGalleryFiles.length;
                      if (remainingSlots <= 0) {
                        alert("You’ve already reached the 4-image limit.");
                        return;
                      }

                      const validFiles = files
                        .slice(0, remainingSlots)
                        .filter(
                          (f) =>
                            f.type.startsWith("image/") &&
                            f.size <= MAX_FILE_SIZE,
                        );

                      setNewGalleryFiles([...newGalleryFiles, ...validFiles]);
                    }}
                  />

                  <FieldDescription>
                    Upload up to 4 images total (excluding thumbnail).
                  </FieldDescription>
                </Field>
              </FieldGroup>

              <Button
                type="submit"
                disabled={
                  isSubmitting ||
                  (!isDirty &&
                    !newThumbnail &&
                    existingGalleryToDelete.length === 0 &&
                    newGalleryFiles.length === 0)
                }
              >
                {isSubmitting ? "Updating..." : "Update Product"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
