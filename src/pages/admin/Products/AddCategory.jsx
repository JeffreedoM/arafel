// forms
import { useForm } from "react-hook-form";
import z from "zod";
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
import { supabase } from "@/lib/supabase-client";

export default function AddCategory({
  categories,
  onSelectCategory,
  selectedCategory,
  setCategories,
  error,
}) {
  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(
      z.object({
        categoryName: z.string().min(1, "Category Name is required"),
      }),
    ),
  });

  const [openCategories, setOpenCategories] = useState(false);
  const [openAddCategory, setOpenAddCategory] = useState(false);

  const fetchCategories = async () => {
    const { data, error } = await supabase
      .from("product_categories")
      .select("*")
      .order("category_name");

    if (error) {
      console.error("Fetch categories error:", error);
      return [];
    }

    return data;
  };

  const submitCategory = async (data) => {
    const ucwords = (str) =>
      str
        .toLowerCase()
        .trim()
        .replace(/\b\w/g, (char) => char.toUpperCase());

    const formattedName = ucwords(data.categoryName);

    // 🔍 check if category already exists (case-insensitive)
    const { data: existingCategory, error: fetchError } = await supabase
      .from("product_categories")
      .select("id")
      .ilike("category_name", formattedName)
      .maybeSingle();

    if (fetchError) {
      console.error("Error checking category:", fetchError.message);
      return;
    }

    if (existingCategory) {
      alert("Category already exists");
      return;
    }

    // ➕ insert new category
    const { data: insertedCategory, error } = await supabase
      .from("product_categories")
      .insert({
        category_name: formattedName,
      })
      .select()
      .single();

    if (error) {
      console.error("Error adding category:", error.message);
      return;
    }

    console.log("Category added:", insertedCategory);
    setOpenAddCategory(false);
    reset();
    fetchCategories().then(setCategories);
  };

  return (
    <Field className="flex flex-col gap-4">
      <FieldLabel>Product Category</FieldLabel>
      <Button
        onClick={() => setOpenCategories(true)}
        variant="outline"
        type="button"
        className="w-fit cursor-pointer"
      >
        {selectedCategory
          ? categories.find((cat) => cat.id === selectedCategory)?.category_name
          : "Select Category"}
      </Button>
      {error && (
        <span className="-mt-1 text-sm font-semibold text-red-500">
          {error.message}
        </span>
      )}

      <CommandDialog open={openCategories} onOpenChange={setOpenCategories}>
        <Command>
          <CommandInput placeholder="Type a category name or add a new category" />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>

            {/* Add Category */}

            <Dialog open={openAddCategory} onOpenChange={setOpenAddCategory}>
              <DialogTrigger className="hover:bg-accent hover:text-accent-foreground mx-1 my-1 w-full cursor-pointer rounded-md p-3 pb-4 text-sm underline underline-offset-8">
                Add New Category
              </DialogTrigger>
              <form>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle className="mb-4">
                      New Product Category
                    </DialogTitle>
                    <FieldGroup>
                      <Field>
                        <FieldLabel htmlFor="categoryName">
                          Category Name
                        </FieldLabel>
                        <Input
                          id="categoryName"
                          {...register("categoryName")}
                        />
                        {errors.categoryName && (
                          <span className="-mt-1 text-sm font-semibold text-red-500">
                            {errors.categoryName.message}
                          </span>
                        )}
                      </Field>
                      <Field>
                        <Button
                          type="submit"
                          onClick={handleSubmit(submitCategory)}
                          className="cursor-pointer"
                        >
                          Add Category
                        </Button>
                      </Field>
                    </FieldGroup>
                  </DialogHeader>
                </DialogContent>
              </form>
            </Dialog>

            {/* End of Add Category */}

            <CommandGroup heading="Categories">
              {categories.map((category) => (
                <CommandItem
                  key={category.id}
                  onSelect={() => {
                    console.log("Selected category:", category);
                    onSelectCategory(category.id);
                    setOpenCategories(false);
                  }}
                >
                  {category.category_name}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </CommandDialog>
    </Field>
  );
}
