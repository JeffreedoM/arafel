// forms
import { useForm } from "react-hook-form";
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
import { useState } from "react";
import { supabase } from "@/lib/supabase-client";

export default function AddCategory() {
  const {
    register,
    handleSubmit,
    watch,
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

  const submitCategory = async (data) => {
    const { categoryName } = data;

    const { data: insertedCategory, error } = await supabase
      .from("product_categories")
      .insert([
        {
          category_name: categoryName,
        },
      ])
      .select()
      .single();
    setOpenAddCategory(false);

    if (error) {
      console.error("Error adding category:", error.message);
      return;
    }

    console.log("Category added:", insertedCategory);
  };

  return (
    <Field className="flex flex-col gap-4">
      <Button
        onClick={() => setOpenCategories(true)}
        variant="outline"
        className="w-fit cursor-pointer"
      >
        Select Product Category
      </Button>
      <CommandDialog open={openCategories} onOpenChange={setOpenCategories}>
        <Command>
          <CommandInput placeholder="Type a category name or add a new category" />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>

            {/* Add Category */}

            <Dialog open={openAddCategory} onOpenChange={setOpenAddCategory}>
              <DialogTrigger className="hover:bg-accent hover:text-accent-foreground mx-1 my-1 w-full cursor-pointer rounded-md p-2 text-sm">
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
              <CommandItem>Calendar</CommandItem>
              <CommandItem>Search Emoji</CommandItem>
              <CommandItem>Calculator</CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </CommandDialog>
    </Field>
  );
}
