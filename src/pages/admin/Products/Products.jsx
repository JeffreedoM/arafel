import { SiteHeader } from "@/components/site-header";
import { columns } from "./columns";
import { DataTable } from "./products-table";
import { Button } from "@/components/ui/button";
import { Link } from "react-router";
import { supabase } from "@/lib/supabase-client";
import { useEffect, useState } from "react";
import { Plus, RefreshCw, Package } from "lucide-react";

export default function Products() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchProducts = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    const { data, error } = await supabase
      .from("products")
      .select(
        `
        id,
        product_name,
        price,
        stock,
        status,
        is_featured,
        product_categories ( category_name )
      `,
      )
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Fetch products error:", error);
    } else {
      setData(data || []);
    }

    setLoading(false);
    setRefreshing(false);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return (
    <>
      <SiteHeader title="Products" />

      <div className="bg-background flex flex-1 flex-col p-6 md:p-8">
        <div className="mx-auto w-full max-w-7xl space-y-6">
          {/* Dashboard Header Section */}
          <div className="flex flex-col gap-4 border-b pb-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Package className="text-muted-foreground h-6 w-6" />
                <h1 className="text-2xl font-bold tracking-tight">
                  Product Catalog
                </h1>
              </div>
              <p className="text-muted-foreground mt-1 text-sm">
                Manage your inventory, pricing, categories, and visibility
                states.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 self-end sm:self-auto">
              <Button
                variant="outline"
                size="icon"
                onClick={() => fetchProducts(true)}
                disabled={loading || refreshing}
                title="Refresh catalog"
                className="h-9 w-9"
              >
                <RefreshCw
                  className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
                />
              </Button>

              <Link to="create">
                <Button className="h-9 gap-1.5 shadow-sm">
                  <Plus className="h-4 w-4" />
                  <span>Create Product</span>
                </Button>
              </Link>
            </div>
          </div>

          {/* Data Table Workspace */}
          <div className="bg-card text-card-foreground rounded-xl border p-2 shadow-sm sm:p-4">
            {loading ? (
              <div className="flex flex-col items-center justify-center gap-3 py-20">
                <RefreshCw className="text-muted-foreground h-6 w-6 animate-spin" />
                <p className="text-muted-foreground animate-pulse text-sm font-medium">
                  Loading catalog...
                </p>
              </div>
            ) : (
              <DataTable columns={columns} data={data} />
            )}
          </div>
        </div>
      </div>
    </>
  );
}
