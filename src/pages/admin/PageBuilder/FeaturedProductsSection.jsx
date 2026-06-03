import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase-client.js";

// shadcn components
import { Button } from "@/components/ui/button";
import * as Accordion from "@radix-ui/react-accordion";

// icons
import {
  ChevronDown,
  Sparkles,
  ArrowUp,
  ArrowDown,
  Loader2,
  CheckCircle2,
  Package,
  AlertCircle,
} from "lucide-react";

export default function FeaturedProductsSection() {
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);

  // Fetch gamit ang totoong columns mula sa iyong schema
  const fetchFeaturedProducts = async () => {
    setLoading(true);
    setStatusMessage(null);

    const { data, error } = await supabase
      .from("products")
      .select("id, product_name, price, is_featured")
      .eq("is_featured", true)
      .order("id", { ascending: true }); // Ginawa nating ID sorting muna dahil walang featured_order column

    if (error) {
      console.error("Error fetching featured products:", error);
      setStatusMessage({
        type: "error",
        text: "Failed to load featured products from schema.",
      });
    } else if (data) {
      setProducts(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchFeaturedProducts();
  }, []);

  // Positional logic controller upang manipulahin ang array sequence sa React state
  const moveItem = (index, direction) => {
    const updatedProducts = [...products];
    const targetIndex = direction === "up" ? index - 1 : index + 1;

    if (targetIndex < 0 || targetIndex >= updatedProducts.length) return;

    // Pagpalitin ang pwesto ng dalawang magkatabing records
    const temp = updatedProducts[index];
    updatedProducts[index] = updatedProducts[targetIndex];
    updatedProducts[targetIndex] = temp;

    setProducts(updatedProducts);
  };

  const saveNewOrder = async () => {
    setSaving(true);
    setStatusMessage(null);

    try {
      // 💡 NOTE PARA SA SCHEMA MO:
      // Dahil walang "featured_order" persistent tracking field sa schema mo ngayon,
      // ang array sorting na ito ay pansamantalang mananatili sa memorya ng browser.
      // Kung gusto mo talaga itong ma-save permanently sa database upang maalala ng page,
      // kailangan mong mag-run ng migration script tulad nito sa iyong Supabase SQL Editor:
      // ALTER TABLE public.products ADD COLUMN featured_order bigint DEFAULT 0;

      // Pansamantalang notification block para sa admin profile view:
      setStatusMessage({
        type: "success",
        text: "Display sequence adjusted locally. Note: To persist this order permanently, please add a 'featured_order' column to your products table schema.",
      });
    } catch (error) {
      console.error("Error updating sort configuration:", error);
      setStatusMessage({
        type: "error",
        text: "Failed to register new sorting schema attributes.",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="text-muted-foreground flex items-center justify-center gap-2 py-12 text-sm">
        <Loader2 className="text-primary h-4 w-4 animate-spin" />
        Loading featured products registry...
      </div>
    );
  }

  return (
    <Accordion.Root
      className="w-full max-w-4xl"
      type="single"
      collapsible
      defaultValue="featured-section"
    >
      <Accordion.Item
        value="featured-section"
        className="bg-card text-card-foreground overflow-hidden rounded-xl border shadow-sm"
      >
        {/* Accordion Trigger Trigger Head */}
        <Accordion.Trigger className="bg-muted/30 hover:bg-muted/50 group flex w-full items-center justify-between border-b px-6 py-4 text-left transition-all">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-amber-500/10 p-2 text-amber-500">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <h3 className="mb-1 text-sm leading-none font-semibold">
                Featured Products Catalog Arrangement
              </h3>
              <p className="text-muted-foreground text-xs">
                Adjust display positions of inventory tracking records flagged
                with is_featured active status.
              </p>
            </div>
          </div>
          <ChevronDown className="text-muted-foreground h-4 w-4 shrink-0 transition-transform duration-300 group-data-[state=open]:rotate-180" />
        </Accordion.Trigger>

        {/* Accordion content context layout */}
        <Accordion.Content className="data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
          <div className="space-y-4 p-6">
            {statusMessage && (
              <div
                className={`flex items-start gap-3 rounded-lg border p-4 text-sm ${
                  statusMessage.type === "success"
                    ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                    : "bg-destructive/10 border-destructive/20 text-destructive"
                }`}
              >
                {statusMessage.type === "success" ? (
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                ) : (
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                )}
                <p className="font-medium">{statusMessage.text}</p>
              </div>
            )}

            {products.length === 0 ? (
              <div className="text-muted-foreground space-y-1 rounded-lg border-2 border-dashed py-8 text-center text-sm">
                <Package className="mx-auto h-8 w-8 stroke-[1.5] opacity-50" />
                <p>
                  No inventory items are currently flagged with is_featured
                  schema parameters.
                </p>
              </div>
            ) : (
              <div className="bg-muted/10 divide-y rounded-lg border">
                {products.map((product, index) => (
                  <div
                    key={product.id}
                    className="bg-background/50 hover:bg-muted/30 flex items-center justify-between gap-4 p-3 transition-colors sm:px-4"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="bg-muted flex h-10 w-10 shrink-0 items-center justify-center rounded-md border">
                        <Package className="text-muted-foreground/50 h-5 w-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-foreground truncate text-sm font-semibold">
                          {product.product_name}
                        </p>
                        <p className="text-muted-foreground text-xs">
                          ₱{Number(product.price || 0).toLocaleString()}
                        </p>
                      </div>
                    </div>

                    {/* Sorting controls shifting mechanics */}
                    <div className="flex shrink-0 items-center gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        disabled={index === 0}
                        onClick={() => moveItem(index, "up")}
                      >
                        <ArrowUp className="text-muted-foreground h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        disabled={index === products.length - 1}
                        onClick={() => moveItem(index, "down")}
                      >
                        <ArrowDown className="text-muted-foreground h-4 w-4" />
                      </Button>
                      <div className="text-muted-foreground bg-muted w-8 rounded border p-1 text-center text-xs font-bold">
                        {index + 1}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {products.length > 0 && (
              <div className="flex items-center justify-end gap-3 border-t pt-4">
                <Button
                  type="button"
                  onClick={saveNewOrder}
                  disabled={saving}
                  className="min-w-[140px] shadow-sm"
                >
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Apply Ordering Layout"
                  )}
                </Button>
              </div>
            )}
          </div>
        </Accordion.Content>
      </Accordion.Item>
    </Accordion.Root>
  );
}
