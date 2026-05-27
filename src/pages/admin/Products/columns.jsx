import { MoreHorizontal, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
    header: "Product Name",
  },
  {
    accessorKey: "product_categories.category_name",
    header: "Category",
    cell: ({ row }) =>
      row.original.product_categories?.category_name || "Uncategorized",
  },
  {
    accessorKey: "price",
    header: "Price",
    cell: ({ row }) =>
      `₱${parseFloat(row.original.price || 0).toLocaleString()}`,
  },
  {
    accessorKey: "stock",
    header: "Stock",
    cell: ({ row }) => {
      const stock = parseInt(row.original.stock);
      return (
        <Badge variant={stock > 0 ? "outline" : "destructive"}>
          {stock > 0 ? stock : "Out of Stock"}
        </Badge>
      );
    },
  },
  {
    accessorKey: "is_featured",
    header: "Featured",
    cell: ({ row }) =>
      row.original.is_featured ? (
        <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
      ) : null,
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <Badge
        variant={row.original.status === "active" ? "default" : "secondary"}
      >
        {row.original.status || "Draft"}
      </Badge>
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const product = row.original;
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(product.id)}
            >
              Copy ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <Link to={`/admin/products/${product.id}`}>
              <DropdownMenuItem>View/Edit Product</DropdownMenuItem>
            </Link>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
