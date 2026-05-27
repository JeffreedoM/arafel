"use client";

import { SiteHeader } from "@/components/site-header";
import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import {
  Check,
  ChevronsUpDown,
  Calendar as IconCalendar,
  Megaphone as IconMegaphone,
  Tag as IconTag,
  X as IconX,
  ArrowLeft as IconArrowLeft,
} from "lucide-react";

import { supabase } from "@/lib/supabase-client";

export default function NewCampaign() {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm();

  const [products, setProducts] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      const { data, error } = await supabase
        .from("products")
        .select("id, product_name");

      if (error) {
        console.error("Error pulling product list:", error);
      } else {
        setProducts(data || []);
      }
    };

    fetchProducts();
  }, []);

  const onSubmit = async (formData) => {
    try {
      // 1️⃣ Create the primary campaign header entry
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

      // 2️⃣ Link selected products to the campaign via the pivot table
      if (selectedProducts.length > 0) {
        const campaignProducts = selectedProducts.map((productId) => ({
          campaign_id: campaign.id,
          product_id: productId,
        }));

        const { error: relationError } = await supabase
          .from("campaign_products")
          .insert(campaignProducts);

        if (relationError) throw relationError;
      }

      console.log("Campaign created successfully");
      reset();
      setSelectedProducts([]);

      // Redirect back to main page after smooth creation
      navigate("/campaigns");
    } catch (err) {
      console.error("Error creating campaign structural layout records:", err);
    }
  };

  const handleToggleProduct = (productId) => {
    if (selectedProducts.includes(productId)) {
      setSelectedProducts(selectedProducts.filter((id) => id !== productId));
    } else {
      setSelectedProducts([...selectedProducts, productId]);
    }
  };

  return (
    <>
      <SiteHeader title="Create Campaign" />

      <div className="bg-muted/20 flex-1 p-4 md:p-8">
        <div className="mx-auto max-w-2xl space-y-4">
          {/* Back Action Helper Link Anchor */}
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-foreground"
            onClick={() => navigate(-1)}
          >
            <IconArrowLeft className="mr-2 h-4 w-4" /> Back to Campaigns
          </Button>

          <Card className="border-muted/70 shadow-sm">
            <CardHeader className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="bg-primary/10 text-primary rounded-md p-2">
                  <IconMegaphone className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-xl font-bold">
                    New Marketing Initiative
                  </CardTitle>
                  <CardDescription>
                    Configure event time schedules and link structural retail
                    collections.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <form onSubmit={handleSubmit(onSubmit)}>
              <CardContent className="space-y-5">
                {/* Field: Campaign Title Definition */}
                <div className="space-y-2">
                  <label
                    htmlFor="campaign_name"
                    className="text-foreground flex items-center gap-1.5 text-sm font-medium tracking-tight"
                  >
                    <IconMegaphone className="text-muted-foreground/70 h-4 w-4" />
                    Campaign Name
                  </label>
                  <Input
                    id="campaign_name"
                    placeholder="e.g., Grand Valentine Bouquet Blitz, Christmas Sale"
                    className={
                      errors.campaign_name
                        ? "border-destructive focus-visible:ring-destructive"
                        : ""
                    }
                    {...register("campaign_name", { required: true })}
                  />
                  {errors.campaign_name && (
                    <p className="text-destructive text-xs font-medium">
                      Campaign identification header title is required.
                    </p>
                  )}
                </div>

                {/* Subgrid row wrapper: Date Selectors */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {/* Start Date input component picker */}
                  <div className="space-y-2">
                    <label
                      htmlFor="date_start"
                      className="text-foreground flex items-center gap-1.5 text-sm font-medium tracking-tight"
                    >
                      <IconCalendar className="text-muted-foreground/70 h-4 w-4" />
                      Start Date
                    </label>
                    <Input
                      type="date"
                      id="date_start"
                      className={
                        errors.date_start
                          ? "border-destructive focus-visible:ring-destructive"
                          : ""
                      }
                      {...register("date_start", { required: true })}
                    />
                    {errors.date_start && (
                      <p className="text-destructive text-xs font-medium">
                        Launch target timeline date is required.
                      </p>
                    )}
                  </div>

                  {/* End Date input component picker */}
                  <div className="space-y-2">
                    <label
                      htmlFor="date_end"
                      className="text-foreground flex items-center gap-1.5 text-sm font-medium tracking-tight"
                    >
                      <IconCalendar className="text-muted-foreground/70 h-4 w-4" />
                      End Date
                    </label>
                    <Input
                      type="date"
                      id="date_end"
                      className={
                        errors.date_end
                          ? "border-destructive focus-visible:ring-destructive"
                          : ""
                      }
                      {...register("date_end", { required: true })}
                    />
                    {errors.date_end && (
                      <p className="text-destructive text-xs font-medium">
                        Expiration tracking timeline date is required.
                      </p>
                    )}
                  </div>
                </div>

                {/* Field: Connected Multi-Select Products Combobox Popover */}
                <div className="space-y-2">
                  <label className="text-foreground flex items-center gap-1.5 text-sm font-medium tracking-tight">
                    <IconTag className="text-muted-foreground/70 h-4 w-4" />
                    Target Products Range
                  </label>

                  <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={open}
                        className="bg-background border-muted-foreground/20 hover:bg-background w-full justify-between text-left font-normal shadow-sm"
                      >
                        <span
                          className={
                            selectedProducts.length === 0
                              ? "text-muted-foreground"
                              : "text-foreground font-medium"
                          }
                        >
                          {selectedProducts.length > 0
                            ? `Selected (${selectedProducts.length}) inventory catalog items`
                            : "Map store items to this target framework..."}
                        </span>
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>

                    <PopoverContent
                      className="w-[var(--radix-popover-trigger-width)] p-0"
                      align="start"
                    >
                      <Command className="w-full">
                        <CommandInput placeholder="Type query parameter to search..." />
                        <CommandList>
                          <CommandEmpty>
                            No mapped product entity entries match this lookup.
                          </CommandEmpty>
                          <CommandGroup className="max-h-52 overflow-y-auto">
                            {products.map((product) => {
                              const isSelected = selectedProducts.includes(
                                product.id,
                              );
                              return (
                                <CommandItem
                                  key={product.id}
                                  value={product.product_name}
                                  onSelect={() =>
                                    handleToggleProduct(product.id)
                                  }
                                  className="flex cursor-pointer items-center justify-between"
                                >
                                  <div className="flex items-center gap-2">
                                    <div
                                      className={`flex h-4 w-4 items-center justify-center rounded border ${isSelected ? "bg-primary border-primary text-primary-foreground" : "border-muted-foreground/40"}`}
                                    >
                                      {isSelected && (
                                        <Check className="h-3 w-3 stroke-[3]" />
                                      )}
                                    </div>
                                    <span>{product.product_name}</span>
                                  </div>
                                  <span className="text-muted-foreground/60 font-mono text-xs">
                                    #{product.id}
                                  </span>
                                </CommandItem>
                              );
                            })}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>

                  {/* Redesigned interactive Badge tags section */}
                  {selectedProducts.length > 0 && (
                    <div className="bg-muted/40 mt-3 rounded-lg border p-3">
                      <p className="text-muted-foreground mb-2 text-[11px] font-semibold tracking-wider uppercase">
                        Currently Linked Inventory ({selectedProducts.length})
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {selectedProducts.map((id) => {
                          const product = products.find((p) => p.id === id);
                          return (
                            <Badge
                              key={id}
                              variant="secondary"
                              className="border-muted-foreground/10 bg-background hover:bg-destructive/10 hover:text-destructive hover:border-destructive/20 group cursor-pointer gap-1 border py-0.5 pr-1 pl-2.5 text-xs transition-all"
                              onClick={() => handleToggleProduct(id)}
                              title="Click to remove connection"
                            >
                              <span>{product?.product_name}</span>
                              <div className="group-hover:bg-destructive/20 rounded-sm p-0.5">
                                <IconX className="text-muted-foreground group-hover:text-destructive h-3 w-3" />
                              </div>
                            </Badge>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>

              <CardFooter className="bg-muted/20 flex items-center justify-end gap-3 border-t px-6 py-4">
                <Button
                  type="button"
                  variant="outline"
                  disabled={isSubmitting}
                  onClick={() => navigate("/admin/campaigns")}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="min-w-[120px]"
                >
                  {isSubmitting ? "Processing..." : "Deploy Campaign"}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>
      </div>
    </>
  );
}
