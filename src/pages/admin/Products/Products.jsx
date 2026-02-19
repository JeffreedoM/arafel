import { SiteHeader } from "@/components/site-header";

import { columns } from "./columns";
import { DataTable } from "./products-table";
import { Button } from "@/components/ui/button";
import { Link } from "react-router";
import { supabase } from "@/lib/supabase-client";
import { useEffect, useState } from "react";

import { MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Products() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("products")
      .select(
        `
      *,
      product_categories (
        id,
        category_name
      )
    `,
      )
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Fetch products error:", error);
      setLoading(false);
      return;
    }

    setData(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  console.log("Products data:", data);

  return (
    <>
      <SiteHeader title="Products" />
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="container mx-auto py-10">
            <div className="mb-2 flex items-center justify-end">
              <Link to="create">
                <Button className="cursor-pointer">Create Product</Button>
              </Link>
            </div>

            {loading ? (
              <p className="text-muted-foreground text-sm">Loading products…</p>
            ) : (
              <DataTable columns={columns} data={data} />
            )}
          </div>
        </div>
      </div>
    </>
  );
}
