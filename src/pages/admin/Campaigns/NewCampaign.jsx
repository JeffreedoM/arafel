"use client";

import { SiteHeader } from "@/components/site-header";

import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel, FieldGroup } from "@/components/ui/field";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Check, ChevronsUpDown } from "lucide-react";

import { supabase } from "@/lib/supabase-client";

export default function NewCampaign() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();

  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      const { data, error } = await supabase
        .from("products")
        .select("id, product_name");

      if (error) {
        console.error(error);
      } else {
        setProducts(data);
        console.log("Products fetched successfully:", data);
      }
    };

    fetchProducts();
  }, []);

  const filteredProducts = products.filter((p) =>
    p.product_name.toLowerCase().includes(search.toLowerCase()),
  );

  const onSubmit = async (formData) => {
    try {
      // 1️⃣ Create the campaign
      const { data: campaign, error } = await supabase
        .from("campaigns")
        .insert({
          campaign_name: formData.campaign_name,
          date_start: formData.date_start,
          date_end: formData.date_end,
        })
        .select()
        .single();

      if (error) throw error;

      // 2️⃣ Link selected products to the campaign
      if (selectedProducts.length > 0) {
        const campaignProducts = selectedProducts.map((productId) => ({
          campaign_id: campaign.id, // ← correct column
          product_id: productId,
        }));

        const { error: relationError } = await supabase
          .from("campaign_products") // ← insert into pivot table
          .insert(campaignProducts);

        if (relationError) throw relationError;
      }

      console.log("Campaign created successfully");
    } catch (err) {
      console.error("Error creating campaign:", err);
    }
  };

  return (
    <>
      <SiteHeader title="Campaigns" />

      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="container mx-auto py-10">
            <form onSubmit={handleSubmit(onSubmit)}>
              <FieldGroup className="max-w-md">
                {/* Campaign Name */}
                <Field>
                  <FieldLabel htmlFor="campaign_name">Campaign Name</FieldLabel>

                  <Input
                    id="campaign_name"
                    {...register("campaign_name", { required: true })}
                  />

                  {errors.campaign_name && (
                    <p className="text-destructive text-sm">
                      This field is required
                    </p>
                  )}
                </Field>

                {/* Start Date */}
                <Field>
                  <FieldLabel htmlFor="date_start">Start Date</FieldLabel>

                  <Input
                    type="date"
                    id="date_start"
                    {...register("date_start", { required: true })}
                  />

                  {errors.date_start && (
                    <p className="text-destructive text-sm">
                      This field is required
                    </p>
                  )}
                </Field>

                {/* End Date */}
                <Field>
                  <FieldLabel htmlFor="date_end">End Date</FieldLabel>

                  <Input
                    type="date"
                    id="date_end"
                    {...register("date_end", { required: true })}
                  />

                  {errors.date_end && (
                    <p className="text-destructive text-sm">
                      This field is required
                    </p>
                  )}
                </Field>

                {/* Product Search */}
                <Field>
                  <FieldLabel>Products</FieldLabel>

                  <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={open}
                        className="w-full justify-between"
                      >
                        {selectedProducts.length > 0
                          ? `${selectedProducts.length} product(s) selected`
                          : "Select products"}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>

                    <PopoverContent className="w-full p-0">
                      <Command>
                        <CommandInput placeholder="Search product..." />

                        <CommandEmpty>No product found.</CommandEmpty>

                        <CommandGroup className="max-h-60 overflow-y-auto">
                          {products.map((product) => {
                            const selected = selectedProducts.includes(
                              product.id,
                            );

                            return (
                              <CommandItem
                                key={product.id}
                                value={product.product_name}
                                onSelect={() => {
                                  if (selected) {
                                    setSelectedProducts(
                                      selectedProducts.filter(
                                        (id) => id !== product.id,
                                      ),
                                    );
                                  } else {
                                    setSelectedProducts([
                                      ...selectedProducts,
                                      product.id,
                                    ]);
                                  }
                                }}
                              >
                                <Check
                                  className={`mr-2 h-4 w-4 ${
                                    selected ? "opacity-100" : "opacity-0"
                                  }`}
                                />

                                {product.product_name}
                              </CommandItem>
                            );
                          })}
                        </CommandGroup>
                      </Command>
                    </PopoverContent>
                  </Popover>

                  {/* Selected products */}
                  <div className="mt-2 flex flex-wrap gap-2">
                    {selectedProducts.map((id) => {
                      const product = products.find((p) => p.id === id);

                      return (
                        <span
                          key={id}
                          className="bg-muted cursor-pointer rounded px-2 py-1 text-sm"
                          onClick={() =>
                            setSelectedProducts(
                              selectedProducts.filter((p) => p !== id),
                            )
                          }
                        >
                          {product?.product_name} ✕
                        </span>
                      );
                    })}
                  </div>
                </Field>

                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Creating..." : "Create Campaign"}
                </Button>
              </FieldGroup>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
