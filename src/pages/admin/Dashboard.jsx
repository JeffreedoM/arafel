import { ChartAreaInteractive } from "@/components/chart-area-interactive";
import { DataTable } from "@/components/data-table";
import { SectionCards } from "@/components/section-cards";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  PlusCircle,
  Sparkles,
  LayoutDashboard,
  ArrowRight,
} from "lucide-react";

// Mock data para sa DataTable (Low Stock Inventory)
// Tanging mga standard products lang na may exact stock ang lalabas dito
const lowStockData = [
  {
    id: 1,
    name: "Premium Red Roses (Single)",
    category: "Flowers",
    stock: 3,
    status: "Critical",
  },
  {
    id: 2,
    name: "Dark Chocolate Box (Medium)",
    category: "Chocolates",
    stock: 5,
    status: "Low Stock",
  },
  {
    id: 3,
    name: "Fluffy Teddy Bear (Large)",
    category: "Stuffed Toys",
    stock: 2,
    status: "Critical",
  },
  {
    id: 4,
    name: "Scented Candle - Lavender",
    category: "Add-ons",
    stock: 4,
    status: "Low Stock",
  },
];

// Mock column definitions para sa iyong DataTable component
const columns = [
  { header: "Product Name", accessorKey: "name" },
  { header: "Category", accessorKey: "category" },
  {
    header: "Stock Left",
    accessorKey: "stock",
    cell: ({ row }) => (
      <span className="text-destructive font-semibold">
        {row.original.stock} pcs
      </span>
    ),
  },
  {
    header: "Status",
    accessorKey: "status",
    cell: ({ row }) => (
      <Badge
        variant={row.original.status === "Critical" ? "destructive" : "warning"}
      >
        {row.original.status}
      </Badge>
    ),
  },
];

export default function Dashboard() {
  return (
    <>
      {/* Top Navigation / Header */}
      <SiteHeader title="Dashboard Overview" />

      <div className="bg-muted/20 flex flex-1 flex-col space-y-6 p-4 md:p-6">
        {/* 1. SECTION CARDS: Naglalaman ng mga pangunahing KPI counters */}
        <SectionCards />

        {/* 2. MIDDLE SECTION: Interactive Chart Area */}
        <div className="grid grid-cols-1 gap-6">
          <Card className="shadow-sm">
            <CardHeader className="flex flex-col items-start space-y-2 pb-2">
              <CardTitle>Analytics & Insights</CardTitle>
              <CardDescription>
                Visual monitoring of inventory distributions and operational
                campaigns.
              </CardDescription>
            </CardHeader>
            <CardContent className="px-2 sm:px-6">
              <ChartAreaInteractive />
            </CardContent>
          </Card>
        </div>

        {/* 3. BOTTOM SECTION: Hati sa Dalawa gamit ang Grid Layout */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Column 1 & 2: Low Stock Inventory Table (Gamit ang DataTable component mo) */}
          <div className="space-y-4 lg:col-span-2">
            <Card className="h-full shadow-sm">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Critical Inventory Monitor</CardTitle>
                    <CardDescription>
                      Standard products requiring immediate restocking.
                      (Customizable items excluded)
                    </CardDescription>
                  </div>
                  <Button variant="outline" size="sm">
                    View All Inventory <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {/* Ipinapasa ang mock data at columns sa iyong existing DataTable */}
                <DataTable data={lowStockData} columns={columns} />
              </CardContent>
            </Card>
          </div>

          {/* Column 3: Quick Controls, Campaigns Info, at Homepage Structure */}
          <div className="space-y-6">
            {/* Quick Actions Panel */}
            <Card className="shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle>Quick Management</CardTitle>
                <CardDescription>
                  Rapid administrative operational shortcuts.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-2">
                <Button
                  className="w-full justify-start gap-2"
                  variant="default"
                >
                  <PlusCircle className="h-4 w-4" /> Add New Product
                </Button>
                <Button
                  className="w-full justify-start gap-2"
                  variant="outline"
                >
                  <Sparkles className="h-4 w-4 text-amber-500" /> Launch New
                  Campaign
                </Button>
                <Button
                  className="w-full justify-start gap-2"
                  variant="outline"
                >
                  <LayoutDashboard className="h-4 w-4 text-blue-500" /> Open
                  Page Builder
                </Button>
              </CardContent>
            </Card>

            {/* Homepage Layout Status (Basi sa Page Builder state) */}
            <Card className="shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle>Live Homepage Layout</CardTitle>
                <CardDescription>
                  Current order of dynamic sections on the frontpage.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border-muted-foreground/30 relative ml-2 space-y-4 border-l pl-4">
                  <div className="relative">
                    <span className="bg-primary absolute top-1 -left-[21px] flex h-2 w-2 rounded-full" />
                    <p className="text-sm font-medium">
                      1. Hero Banner Section
                    </p>
                  </div>
                  <div className="relative">
                    <span className="absolute top-1 -left-[21px] flex h-2 w-2 rounded-full bg-amber-500" />
                    <p className="text-sm font-medium">
                      2. Christmas Special Campaign
                    </p>
                    <p className="text-muted-foreground text-xs">
                      Active Discount: 15% OFF
                    </p>
                  </div>
                  <div className="relative">
                    <span className="bg-primary absolute top-1 -left-[21px] flex h-2 w-2 rounded-full" />
                    <p className="text-sm font-medium">
                      3. Product Showcase Catalog
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
