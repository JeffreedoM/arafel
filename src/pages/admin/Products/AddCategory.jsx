// forms
import { useForm } from "react-hook-form";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

// shadcn
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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
import { Field, FieldLabel } from "@/components/ui/field";
import { useState } from "react";
import { supabase } from "@/lib/supabase-client";
import {
  FolderPlus,
  Folder,
  ChevronsUpDown,
  Plus,
  Loader2,
} from "lucide-react";

export default function AddCategory({
  categories = [],
  onSelectCategory,
  selectedCategory,
  setCategories,
  error,
}) {
  const {
    register,
    handleSubmit,
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
  const [searchQuery, setSearchQuery] = useState("");

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

    // check if category already exists
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

    // insert new category
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

    setOpenAddCategory(false);
    reset();

    // Automatically select the freshly generated category item
    onSelectCategory(insertedCategory.id);

    const freshData = await fetchCategories();
    setCategories(freshData);
  };

  const currentSelectionName = categories.find(
    (cat) => cat.id === selectedCategory,
  )?.category_name;

  return (
    <Field className="space-y-2">
      <FieldLabel className="text-foreground text-sm font-semibold">
        Product Category
      </FieldLabel>

      {/* Combobox Selection Action Button */}
      <Button
        onClick={() => setOpenCategories(true)}
        variant="outline"
        type="button"
        className={`h-10 w-full justify-between font-normal shadow-sm ${
          currentSelectionName ? "text-foreground" : "text-muted-foreground"
        } ${error ? "border-destructive focus-visible:ring-destructive" : ""}`}
      >
        <span className="flex items-center gap-2 truncate">
          <Folder className="text-muted-foreground/70 h-4 w-4 shrink-0" />
          {currentSelectionName || "Select product category..."}
        </span>
        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
      </Button>

      {error && (
        <p className="text-destructive mt-1 text-xs font-medium">
          {error.message}
        </p>
      )}

      {/* Main Search Command Dialog */}
      <CommandDialog open={openCategories} onOpenChange={setOpenCategories}>
        <Command label="Search categories" className="rounded-lg shadow-md">
          <CommandInput
            placeholder="Search categories..."
            value={searchQuery}
            onValueChange={setSearchQuery}
          />
          <CommandList className="max-h-[300px] overflow-y-auto p-1">
            {/* Inline Action Option if searching returns empty sets */}
            <CommandEmpty className="py-6 text-center text-sm">
              <p className="text-muted-foreground mb-3">
                No category matching "{searchQuery}"
              </p>
              <Button
                type="button"
                size="sm"
                variant="secondary"
                className="h-8 gap-1.5 text-xs"
                onClick={() => {
                  setOpenCategories(false);
                  setOpenAddCategory(true);
                  // Optional: seed your form reset value using the current queries
                  reset({ categoryName: searchQuery });
                }}
              >
                <Plus className="h-3.5 w-3.5" />
                Add "{searchQuery || "New"}" Category
              </Button>
            </CommandEmpty>

            {/* Creation Trigger Header Button Option */}
            <div className="border-b px-1 py-1">
              <Button
                type="button"
                variant="ghost"
                className="text-primary hover:text-primary hover:bg-primary/5 h-9 w-full justify-start gap-2 px-2 text-xs font-medium"
                onClick={() => {
                  setOpenCategories(false);
                  setOpenAddCategory(true);
                }}
              >
                <FolderPlus className="h-4 w-4" />
                Create a clean, brand new category option
              </Button>
            </div>

            <CommandGroup heading="Existing Registry">
              {categories.map((category) => (
                <CommandItem
                  key={category.id}
                  value={category.category_name}
                  onSelect={() => {
                    onSelectCategory(category.id);
                    setOpenCategories(false);
                    setSearchQuery("");
                  }}
                  className="flex cursor-pointer items-center gap-2 rounded-sm px-2.5 py-2 text-sm"
                >
                  <Folder className="text-muted-foreground/60 h-3.5 w-3.5" />
                  <span className="font-medium">{category.category_name}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </CommandDialog>

      {/* Completely decoupled, structurally isolated Dialog Form element */}
      <Dialog open={openAddCategory} onOpenChange={setOpenAddCategory}>
        <DialogContent className="sm:max-w-md">
          <form
            onSubmit={(e) => {
              e.preventDefault(); // Prevents default page reload
              e.stopPropagation(); // 💥 FIX: Stops the event from hitting the parent product form
              handleSubmit(submitCategory)(e);
            }}
            className="space-y-4"
          >
            <DialogHeader>
              <div className="bg-primary/10 text-primary mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full">
                <FolderPlus className="h-5 w-5" />
              </div>
              <DialogTitle className="text-center text-lg">
                New Product Category
              </DialogTitle>
              <DialogDescription className="text-center text-xs">
                Create alternative organizational scopes. Names format
                automatically to standard capitalization guidelines.
              </DialogDescription>
            </DialogHeader>

            <Field className="space-y-1.5">
              <Input
                id="categoryName"
                placeholder="e.g., Summer Collection, Footwear"
                autoComplete="off"
                {...register("categoryName")}
                className={
                  errors.categoryName
                    ? "border-destructive focus-visible:ring-destructive"
                    : ""
                }
              />
              {errors.categoryName && (
                <p className="text-destructive text-xs font-medium">
                  {errors.categoryName.message}
                </p>
              )}
            </Field>

            <DialogFooter className="gap-2 pt-2 sm:justify-end">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setOpenAddCategory(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={isSubmitting}
                className="font-medium shadow-sm"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Category"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Field>
  );
}
