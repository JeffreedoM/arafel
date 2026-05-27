import { SiteHeader } from "@/components/site-header";
import { supabase } from "@/lib/supabase-client";

// forms
import { useForm } from "react-hook-form";
import { productDefaultValues, productZodSchema } from "./productZodSchema";
import { zodResolver } from "@hookform/resolvers/zod";

// shadcn
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
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
import { useSnackbar } from "notistack";
import {
  ImagePlus,
  PackagePlus,
  ArrowLeft,
  Loader2,
  Sparkles,
} from "lucide-react";
import { Link } from "react-router";

export default function CreateProduct() {
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(productZodSchema),
    defaultValues: productDefaultValues,
  });

  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categories, setCategories] = useState([]);
  const [formKey, setFormKey] = useState(Date.now());

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

  const onSubmit = async (formData) => {
    const loadingKey = enqueueSnackbar(
      "Saving product and uploading assets...",
      { variant: "info", persist: true },
    );

    try {
      if (!imageFile) {
        setImageError("Product image is required.");
        enqueueSnackbar("Please upload a primary product image.", {
          variant: "warning",
        });
        return;
      }

      if (imageError) {
        enqueueSnackbar("Please resolve image errors before submitting.", {
          variant: "warning",
        });
        return;
      }

      const { data: newProduct, error: productError } = await supabase
        .from("products")
        .insert([formData])
        .select()
        .single();

      if (productError) throw productError;

      const imageURL = await uploadImage(imageFile);

      const { error: imageInsertError } = await supabase
        .from("product_images")
        .insert({
          product_id: newProduct.id,
          image_url: imageURL,
          is_thumbnail: true,
        });

      if (imageInsertError) throw imageInsertError;

      if (galleryFiles && galleryFiles.length > 0) {
        for (let i = 0; i < galleryFiles.length; i++) {
          const path = await uploadFile(galleryFiles[i]);
          await supabase.from("product_images").insert({
            product_id: newProduct.id,
            image_url: path,
            is_thumbnail: false,
            order: i + 1,
          });
        }
      }

      enqueueSnackbar("Product saved successfully!", { variant: "success" });

      reset();
      setImageFile(null);
      setGalleryFiles([]);
      setGalleryPreviews([]);
      setGalleryErrors([]);
      setSelectedCategory(null);
      setFormKey(Date.now());
    } catch (err) {
      console.error("Submit Error:", err);
      enqueueSnackbar(
        err.message || "Failed to save product. Please try again.",
        { variant: "error" },
      );
    } finally {
      closeSnackbar(loadingKey);
    }
  };

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

      <div className="bg-muted/20 flex flex-1 flex-col p-6 md:p-8">
        <div className="mx-auto w-full max-w-6xl space-y-6">
          {/* Back Navigation Bar */}
          <div className="flex items-center justify-between">
            <Link
              to="/admin/products"
              className="text-muted-foreground hover:text-foreground inline-flex items-center gap-2 text-sm font-medium transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Catalog
            </Link>
          </div>

          {/* Core Content Form Container */}
          <form
            onSubmit={handleSubmit(onSubmit, (errors) =>
              console.log("Validation Errors:", errors),
            )}
          >
            <div className="grid gap-6 lg:grid-cols-3">
              {/* Left Column: Form Details (Spans 2 columns) */}
              <div className="space-y-6 lg:col-span-2">
                <Card className="shadow-sm">
                  <CardHeader className="space-y-1">
                    <div className="text-primary flex items-center gap-2">
                      <PackagePlus className="h-5 w-5" />
                      <CardTitle className="text-xl">
                        Product Information
                      </CardTitle>
                    </div>
                    <CardDescription>
                      Provide essential information about your items
                      specification, pricing structures, and categorical
                      contexts.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-5">
                    <Field>
                      <FieldLabel htmlFor="product_name">
                        Product Name
                      </FieldLabel>
                      <Input
                        id="product_name"
                        placeholder="e.g., Silk Premium Blouse"
                        {...register("product_name")}
                        className={
                          errors.product_name
                            ? "border-destructive focus-visible:ring-destructive"
                            : ""
                        }
                      />
                      {errors.product_name && (
                        <p className="text-destructive mt-1 text-xs font-medium">
                          {errors.product_name.message}
                        </p>
                      )}
                    </Field>

                    <Field>
                      <FieldLabel htmlFor="product_description">
                        Product Description
                      </FieldLabel>
                      <Textarea
                        id="product_description"
                        placeholder="Describe features, metrics, materials, or details..."
                        rows={4}
                        {...register("product_description")}
                        className={
                          errors.product_description
                            ? "border-destructive focus-visible:ring-destructive resize-none"
                            : "resize-none"
                        }
                      />
                      {errors.product_description && (
                        <p className="text-destructive mt-1 text-xs font-medium">
                          {errors.product_description.message}
                        </p>
                      )}
                    </Field>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <Field>
                        <FieldLabel htmlFor="stock">Available Stock</FieldLabel>
                        <Input
                          type="number"
                          min="0"
                          id="stock"
                          placeholder="0"
                          {...register("stock")}
                          className={
                            errors.stock
                              ? "border-destructive focus-visible:ring-destructive"
                              : ""
                          }
                        />
                        {errors.stock && (
                          <p className="text-destructive mt-1 text-xs font-medium">
                            {errors.stock.message}
                          </p>
                        )}
                      </Field>

                      <Field>
                        <FieldLabel htmlFor="price">
                          Base Retail Price
                        </FieldLabel>
                        <div className="relative">
                          <span className="text-muted-foreground absolute top-1/2 left-3 -translate-y-1/2 text-sm font-semibold select-none">
                            ₱
                          </span>
                          <Input
                            type="number"
                            min="0"
                            id="price"
                            placeholder="0.00"
                            {...register("price")}
                            className={`pl-7 ${errors.price ? "border-destructive focus-visible:ring-destructive" : ""}`}
                          />
                        </div>
                        {errors.price && (
                          <p className="text-destructive mt-1 text-xs font-medium">
                            {errors.price.message}
                          </p>
                        )}
                      </Field>
                    </div>

                    <Field>
                      <FieldLabel htmlFor="price_description">
                        Price Context / Tier Subtitle
                      </FieldLabel>
                      <Textarea
                        id="price_description"
                        placeholder="Optional pricing details (e.g., 'Includes localized sales tax', 'Bulk discounts applicable')"
                        rows={2}
                        {...register("price_description")}
                        className={
                          errors.price_description
                            ? "border-destructive focus-visible:ring-destructive resize-none"
                            : "resize-none"
                        }
                      />
                      {errors.price_description && (
                        <p className="text-destructive mt-1 text-xs font-medium">
                          {errors.price_description.message}
                        </p>
                      )}
                    </Field>
                  </CardContent>
                </Card>

                {/* Categories Management Panel Card */}
                <Card className="shadow-sm">
                  <CardContent className="pt-6">
                    <FieldGroup>
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
                  </CardContent>
                </Card>
              </div>

              {/* Right Column: Imagery & Auxiliary Setup Controls */}
              <div className="space-y-6">
                {/* Showcase Visibility Control */}
                <Card className="border-amber-500/10 bg-amber-500/[0.01] shadow-sm">
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between gap-4">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5 text-sm font-semibold text-amber-700 dark:text-amber-400">
                          <Sparkles className="h-4 w-4 fill-amber-500 text-amber-500" />
                          <span>Featured Product Placement</span>
                        </div>
                        <p className="text-muted-foreground text-xs leading-normal">
                          Enable this toggle to push this inventory item to
                          prime carousels on the main shop window homepage
                          layouts.
                        </p>
                      </div>
                      <Switch
                        id="is_featured"
                        checked={watch("is_featured") || false}
                        onCheckedChange={(checked) =>
                          setValue("is_featured", checked, {
                            shouldValidate: true,
                            shouldDirty: true,
                          })
                        }
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Media Manager Panel Card */}
                <Card className="shadow-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base font-semibold">
                      Product Media Assets
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Attach visual elements required to represent the asset
                      online.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-5">
                    {/* Primary Image Thumbnail */}
                    <div className="space-y-2">
                      <FieldLabel className="text-xs font-semibold">
                        Primary Thumbnail
                      </FieldLabel>

                      {!previewUrl ? (
                        <label className="bg-muted/30 hover:bg-muted/60 group flex h-40 w-full cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed transition-all">
                          <div className="text-muted-foreground flex flex-col items-center justify-center gap-1 p-4 text-center">
                            <ImagePlus className="text-muted-foreground/70 group-hover:text-foreground mb-1 h-6 w-6 transition-colors" />
                            <span className="text-foreground text-xs font-medium">
                              Click to upload thumbnail
                            </span>
                            <span className="text-muted-foreground text-[10px]">
                              PNG, JPG up to 5MB
                            </span>
                          </div>
                          <Input
                            key={`thumb-${formKey}`}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;
                              setImageError(null);
                              if (!file.type.startsWith("image/")) {
                                setImageError(
                                  "Please select a valid image file.",
                                );
                                return;
                              }
                              if (file.size > MAX_FILE_SIZE) {
                                setImageError("Image must be 5MB or smaller.");
                                return;
                              }
                              setImageFile(file);
                            }}
                          />
                        </label>
                      ) : (
                        <div className="bg-muted/40 relative overflow-hidden rounded-lg border p-2">
                          <img
                            src={previewUrl}
                            alt="Preview"
                            className="h-36 w-full rounded-md border object-cover"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            className="absolute right-4 bottom-4 h-7 px-2.5 text-xs shadow"
                            onClick={() => setImageFile(null)}
                          >
                            Remove
                          </Button>
                        </div>
                      )}

                      {imageError && (
                        <p className="text-destructive mt-1 text-xs font-semibold">
                          {imageError}
                        </p>
                      )}
                    </div>

                    {/* Secondary Product Gallery Entries */}
                    <div className="space-y-2 border-t pt-4">
                      <FieldLabel className="text-xs font-semibold">
                        Additional Gallery Images
                      </FieldLabel>

                      <label className="bg-muted/30 hover:bg-muted/60 group flex h-20 w-full cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed transition-all">
                        <div className="text-muted-foreground flex items-center gap-2 p-2">
                          <ImagePlus className="text-muted-foreground/70 group-hover:text-foreground h-4 w-4" />
                          <span className="text-foreground text-xs font-medium">
                            Attach complementary slides
                          </span>
                        </div>
                        <Input
                          key={`gallery-${formKey}`}
                          type="file"
                          accept="image/*"
                          multiple
                          className="hidden"
                          onChange={(e) => {
                            const files = Array.from(e.target.files ?? []);
                            const validFiles = [];
                            const errors = [];

                            files.slice(0, 4).forEach((file) => {
                              if (!file.type.startsWith("image/")) {
                                errors.push(`${file.name} context invalid.`);
                              } else if (file.size > MAX_FILE_SIZE) {
                                errors.push(`${file.name} exceeds 5MB bounds.`);
                              } else {
                                validFiles.push(file);
                              }
                            });

                            setGalleryFiles(validFiles);
                            setGalleryErrors(errors);

                            const previews = validFiles.map((file) =>
                              URL.createObjectURL(file),
                            );
                            setGalleryPreviews(previews);
                          }}
                        />
                      </label>
                      <p className="text-muted-foreground text-[10px]">
                        Maximum context limit: 4 sliding variations.
                      </p>

                      {galleryErrors.length > 0 && (
                        <div className="text-destructive mt-1 space-y-0.5 text-xs font-medium">
                          {galleryErrors.map((err, i) => (
                            <p key={i}>{err}</p>
                          ))}
                        </div>
                      )}

                      {galleryPreviews.length > 0 && (
                        <div className="bg-muted/20 mt-2 grid grid-cols-4 gap-2 rounded-lg border p-2">
                          {galleryPreviews.map((src, i) => (
                            <div
                              key={i}
                              className="bg-background relative aspect-square overflow-hidden rounded-md border"
                            >
                              <img
                                src={src}
                                alt={`Gallery preview ${i + 1}`}
                                className="h-full w-full object-cover"
                              />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Submission Action Blocks */}
                <div className="flex items-center justify-end gap-3 pt-2">
                  <Link to="/admin/products" className="w-1/2">
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      disabled={isSubmitting}
                    >
                      Cancel
                    </Button>
                  </Link>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-1/2 font-medium shadow-sm"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      "Save Product"
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
