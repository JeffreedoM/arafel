import { SiteHeader } from "@/components/site-header";

import { columns } from "./columns";
import { DataTable } from "./products-table";
import { Button } from "@/components/ui/button";
import { Link } from "react-router";

export default function Products() {
  function getData() {
    // Fetch data from your API here.
    return [
      {
        id: "b3f1c2a9-8d4e-4a91-9f3d-21a8c9e0a111",
        created_by: "2f9c4e88-1a2d-4e6a-9b21-88d3f41c7abc",

        name: "Full-Zip Hoodie",
        description:
          "Soft cotton hoodie with a relaxed fit. Perfect for everyday wear or chilly nights.",

        category_id: "c1a2b3d4-men",
        price: 1499,

        stock: 100,
        status: "active",
        is_featured: true,

        created_at: "2026-02-04T10:15:30.000Z",
        updated_at: "2026-02-04T10:15:30.000Z",
      },

      // ...
    ];
  }

  const data = getData();

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
            <DataTable columns={columns} data={data} />
          </div>
        </div>
      </div>
    </>
  );
}
