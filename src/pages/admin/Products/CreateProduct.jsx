import { SiteHeader } from "@/components/site-header";

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
import AddCategory from "./AddCategory";

export default function CreateProduct() {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(productZodSchema),
    defaultValues: productDefaultValues,
  });
  const onSubmit = (data) => console.log(data);

  // console.log(watch("product_name")); // watch input value by passing the name of it

  const [openCategories, setOpenCategories] = useState(false);

  return (
    <>
      <SiteHeader title="Create Product" />
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="container mx-auto py-10">
            <Card className="w-full max-w-lg">
              <CardHeader>
                <CardTitle>Create Product</CardTitle>
                <CardDescription>
                  Fill out the form below to create a new product.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit(onSubmit)}>
                  <FieldGroup>
                    <Field>
                      <FieldLabel htmlFor="product_name">
                        Product Name
                      </FieldLabel>
                      <Input id="product_name" {...register("product_name")} />
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
                    <AddCategory />

                    <Field orientation="horizontal">
                      <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? "Submitting..." : "Submit"}
                      </Button>
                    </Field>
                  </FieldGroup>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
