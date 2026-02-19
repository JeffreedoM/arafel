import { MoreHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Link } from "react-router";

export const columns = [
  {
    accessorKey: "product_name",
    header: "Name",
  },
  {
    cell: ({ row }) => row.original.product_categories?.category_name ?? "—",
    header: "Category",
  },
  {
    accessorKey: "status",
    header: "Status",
  },
  // {
  //   accessorKey: "stock",
  //   header: "Stock",
  // },

  {
    id: "actions",
    cell: ({ row }) => {
      const product = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(product.id)}
            >
              Copy Product ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <Link to={`/products/${product.id}`}>
              <DropdownMenuItem>View Product</DropdownMenuItem>
            </Link>
            {/* <DropdownMenuItem>
              <Link to={`/products/${product.id}`}>Edit Product</Link>
            </DropdownMenuItem> */}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
