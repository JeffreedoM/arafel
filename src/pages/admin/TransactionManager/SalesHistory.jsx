import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase-client";
import { SiteHeader } from "@/components/site-header";
import { useSnackbar } from "notistack";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Receipt,
  Search,
  Calendar,
  Layers,
  Eye,
  RefreshCw,
  TrendingUp,
  ShoppingBag,
  MessageSquare,
  CreditCard,
  User,
  FileText,
} from "lucide-react";

export default function SalesHistory() {
  const { enqueueSnackbar } = useSnackbar();
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sourceFilter, setSourceFilter] = useState("all");

  // Dialog state for viewing items of a specific transaction
  const [selectedSale, setSelectedSale] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  // Fetch complete sales records containing joined table items
  const fetchSalesHistory = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("sales")
        .select(
          `
        id,
        invoice_number,
        created_at,
        total_amount,
        amount_received,
        payment_method,
        status,
        notes,
        order_source,
        sales_items (
            id,
            product_id,
            product_name,
            quantity,
            unit_price,
            total_price,
            custom_notes,
            is_manual_entry
        )
        `,
        )
        .order("created_at", { ascending: false });

      if (error) throw error;
      setSales(data || []);
    } catch (error) {
      // ... rest of your error handling
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSalesHistory();
  }, []);

  // Filter conditions mapping
  const filteredSales = sales.filter((sale) => {
    const formattedInvoice =
      sale.invoice_number || `INV-${String(sale.id).padStart(5, "0")}`;

    const matchesSearch =
      formattedInvoice.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (sale.notes &&
        sale.notes.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (sale.cashier_name &&
        sale.cashier_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      sale.sales_items.some((item) =>
        item.product_name.toLowerCase().includes(searchQuery.toLowerCase()),
      );

    const matchesSource =
      sourceFilter === "all" || sale.order_source === sourceFilter;

    return matchesSearch && matchesSource;
  });

  // Derived Business Intelligence aggregates
  const totalRevenue = filteredSales.reduce(
    (sum, sale) => sum + (sale.total_amount || 0),
    0,
  );
  const totalTransactions = filteredSales.length;
  const averageOrderValue =
    totalTransactions > 0 ? totalRevenue / totalTransactions : 0;

  const handleOpenDetails = (sale) => {
    setSelectedSale(sale);
    setIsDetailsOpen(true);
  };

  // Helper styling configuration mapping for financial payment instruments
  const getPaymentBadgeStyles = (method) => {
    switch (method?.toLowerCase()) {
      case "gcash":
        return "border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-50";
      case "maya":
        return "border-green-200 bg-green-50 text-green-700 hover:bg-green-50";
      case "bank":
        return "border-purple-200 bg-purple-50 text-purple-700 hover:bg-purple-50";
      default:
        return "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-50";
    }
  };

  return (
    <div className="bg-background text-foreground flex min-h-screen flex-col">
      <SiteHeader />

      <main className="mx-auto w-full max-w-7xl flex-1 space-y-6 p-6">
        {/* Header Section */}
        <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Sales Ledger & Audit Trail
            </h1>
            <p className="text-muted-foreground text-sm">
              Review persistent transaction records, channel distributions, and
              comprehensive sales breakdowns.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchSalesHistory}
            disabled={loading}
            className="gap-2 shadow-sm"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh Logs
          </Button>
        </div>

        {/* Analytics Breakdown Cards */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Card className="border shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Generated Revenue
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-600">
                ₱
                {totalRevenue.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </div>
              <p className="text-muted-foreground mt-1 text-xs">
                Aggregated from active filters
              </p>
            </CardContent>
          </Card>

          <Card className="border shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Volume of Transactions
              </CardTitle>
              <Receipt className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-800">
                {totalTransactions} Orders
              </div>
              <p className="text-muted-foreground mt-1 text-xs">
                Processed workflow updates
              </p>
            </CardContent>
          </Card>

          <Card className="border shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Average Order Value (AOV)
              </CardTitle>
              <Layers className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                ₱
                {averageOrderValue.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </div>
              <p className="text-muted-foreground mt-1 text-xs">
                Mean value per customer checkout
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Dynamic Filtering Controls Layout */}
        <Card className="border shadow-sm">
          <CardContent className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-3">
            <div className="relative sm:col-span-2">
              <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform" />
              <Input
                placeholder="Search by Invoice Sequence Number, item specs, or cashiers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9"
              />
            </div>
            <div>
              <Select value={sourceFilter} onValueChange={setSourceFilter}>
                <SelectTrigger className="shadow-sm">
                  <SelectValue placeholder="Filter by Order Source" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Channels</SelectItem>
                  <SelectItem value="walk-in">Walk-In Counter</SelectItem>
                  <SelectItem value="messenger">Messenger Inquiry</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Ledger Log Data Table */}
        <Card className="overflow-hidden border shadow-sm">
          {loading ? (
            <div className="text-muted-foreground space-y-2 p-12 text-center">
              <RefreshCw className="text-primary mx-auto h-8 w-8 animate-spin" />
              <p className="text-sm">
                Querying relational tables from database records...
              </p>
            </div>
          ) : filteredSales.length === 0 ? (
            <div className="text-muted-foreground p-12 text-center">
              <Receipt className="text-muted-foreground/60 mx-auto mb-2 h-8 w-8" />
              <p className="text-sm font-medium">
                No sales transactions located matching the parameters.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead className="w-[160px]">
                      Invoice Sequence
                    </TableHead>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>Channel Source</TableHead>
                    <TableHead>Payment Method</TableHead>
                    <TableHead className="text-right">Items Sold</TableHead>
                    <TableHead className="text-right">Total Billing</TableHead>
                    <TableHead className="w-[100px] text-center">
                      Action
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSales.map((sale) => {
                    const totalQty =
                      sale.sales_items?.reduce(
                        (sum, i) => sum + i.quantity,
                        0,
                      ) || 0;

                    // Priority string matching pattern evaluation
                    const displayInvoice =
                      sale.invoice_number ||
                      `INV-${String(sale.id).padStart(5, "0")}`;

                    return (
                      <TableRow
                        key={sale.id}
                        className="hover:bg-muted/10 transition-colors"
                      >
                        <TableCell className="font-mono font-bold text-slate-900">
                          {displayInvoice}
                        </TableCell>
                        <TableCell className="text-muted-foreground text-xs">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="h-3.5 w-3.5 text-slate-400" />
                            {new Date(sale.created_at).toLocaleString("en-US", {
                              dateStyle: "medium",
                              timeStyle: "short",
                            })}
                          </div>
                        </TableCell>
                        <TableCell>
                          {sale.order_source === "walk-in" ? (
                            <Badge
                              variant="secondary"
                              className="gap-1 border bg-slate-100 px-2 py-0.5 text-slate-800 hover:bg-slate-100"
                            >
                              <ShoppingBag className="h-3 w-3" /> Walk-In
                            </Badge>
                          ) : (
                            <Badge
                              variant="secondary"
                              className="gap-1 border border-blue-200 bg-blue-50 px-2 py-0.5 text-blue-700 hover:bg-blue-50"
                            >
                              <MessageSquare className="h-3 w-3" /> Messenger
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={`px-2 py-0.5 capitalize ${getPaymentBadgeStyles(sale.payment_method)}`}
                          >
                            {sale.payment_method}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-medium text-slate-600">
                          {totalQty} pcs
                        </TableCell>
                        <TableCell className="text-right font-bold text-emerald-700">
                          ₱{sale.total_amount?.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-center">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenDetails(sale)}
                            title="Inspect Itemized Breakdown"
                            className="h-8 w-8 rounded-full hover:bg-slate-100"
                          >
                            <Eye className="h-4 w-4 text-slate-600" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </Card>
      </main>

      {/* Itemized Audit Breakdown Dialog Sheet */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="w-full max-w-2xl overflow-hidden p-0 sm:rounded-lg">
          <div className="border-b bg-slate-50 p-6 pb-4">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-xl text-slate-900">
                <Receipt className="h-5 w-5 text-slate-700" />
                Transaction Breakdown Details
              </DialogTitle>
              <DialogDescription className="text-primary pt-1 font-mono text-sm font-semibold">
                Ref: Invoice ID #
                {selectedSale?.invoice_number ||
                  (selectedSale
                    ? `INV-${String(selectedSale.id).padStart(5, "0")}`
                    : "")}
              </DialogDescription>
            </DialogHeader>
          </div>

          {selectedSale && (
            <div className="space-y-5 p-6">
              {/* Metadata Context Grid */}
              <div className="grid grid-cols-2 gap-4 rounded-lg border bg-slate-50/50 p-4 text-sm">
                <div className="space-y-1">
                  <span className="text-muted-foreground flex items-center gap-1 text-xs font-medium">
                    <Calendar className="h-3 w-3" /> Settled Timestamp
                  </span>
                  <span className="font-medium text-slate-800">
                    {new Date(selectedSale.created_at).toLocaleString("en-US", {
                      dateStyle: "long",
                      timeStyle: "short",
                    })}
                  </span>
                </div>
                <div className="space-y-1">
                  <span className="text-muted-foreground flex items-center gap-1 text-xs font-medium">
                    <ShoppingBag className="h-3 w-3" /> Fulfillment Target
                  </span>
                  <span className="font-medium text-slate-800 capitalize">
                    {selectedSale.order_source} Channel
                  </span>
                </div>
                {selectedSale.cashier_name && (
                  <div className="col-span-2 mt-1 space-y-1 border-t pt-2">
                    <span className="text-muted-foreground flex items-center gap-1 text-xs font-medium">
                      <User className="h-3 w-3" /> Handled By Cashier
                    </span>
                    <span className="font-medium text-slate-800">
                      {selectedSale.cashier_name}
                    </span>
                  </div>
                )}
              </div>

              {/* Items Listing */}
              <div className="space-y-2.5">
                <h3 className="text-muted-foreground flex items-center gap-1.5 text-xs font-bold tracking-wider uppercase">
                  <FileText className="h-3.5 w-3.5" /> Purchased Items Ledger
                </h3>
                <div className="max-h-[220px] overflow-y-auto rounded-md border bg-white shadow-inner">
                  <Table>
                    <TableHeader className="sticky top-0 border-b bg-slate-50">
                      <TableRow>
                        <TableHead className="text-xs font-bold text-slate-600 uppercase">
                          Product / Service Name
                        </TableHead>
                        <TableHead className="text-center text-xs font-bold text-slate-600 uppercase">
                          Qty
                        </TableHead>
                        <TableHead className="text-right text-xs font-bold text-slate-600 uppercase">
                          Unit Price
                        </TableHead>
                        <TableHead className="text-right text-xs font-bold text-slate-600 uppercase">
                          Subtotal
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedSale.sales_items?.map((item) => (
                        <TableRow
                          key={item.id}
                          className="text-sm hover:bg-slate-50/50"
                        >
                          <TableCell className="py-3">
                            <div className="font-semibold text-slate-800">
                              {item.product_name}
                              {item.is_manual_entry && (
                                <Badge
                                  variant="outline"
                                  className="ml-1.5 border-amber-200 bg-amber-50 px-1 py-0 text-[10px] font-medium text-amber-700"
                                >
                                  Custom Override
                                </Badge>
                              )}
                            </div>
                            {item.custom_notes && (
                              <p className="text-muted-foreground mt-0.5 text-xs italic">
                                Specs: {item.custom_notes}
                              </p>
                            )}
                          </TableCell>
                          <TableCell className="text-center font-medium text-slate-700">
                            {item.quantity}
                          </TableCell>
                          <TableCell className="text-right text-slate-600">
                            ₱{item.unit_price?.toFixed(2)}
                          </TableCell>
                          <TableCell className="text-right font-medium text-slate-900">
                            ₱{Number(item.total_price || 0).toFixed(2)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>

              {/* Transaction Order Notes */}
              {selectedSale.notes && (
                <div className="rounded-md border bg-slate-50/40 p-3 text-sm">
                  <span className="block text-xs font-semibold tracking-wide text-slate-600 uppercase">
                    Administrative Order Notes:
                  </span>
                  <p className="mt-1 text-xs whitespace-pre-wrap text-slate-700 italic">
                    "{selectedSale.notes}"
                  </p>
                </div>
              )}

              {/* Financial Math Computations */}
              <div className="space-y-2 rounded-lg border bg-slate-50 p-4 text-sm font-medium text-slate-600">
                <div className="flex justify-between">
                  <span>Gross Total Amount:</span>
                  <span className="text-slate-900">
                    ₱{selectedSale.total_amount?.toFixed(2)}
                  </span>
                </div>

                {/* Ipakita ang Amount Received */}
                <div className="flex justify-between">
                  <span>Amount Received:</span>
                  <span className="text-slate-900">
                    ₱{selectedSale.amount_received?.toFixed(2)}
                  </span>
                </div>

                {/* I-compute ang Change */}
                <div className="flex justify-between font-bold text-blue-700">
                  <span>Change to Customer:</span>
                  <span>
                    ₱
                    {Math.max(
                      0,
                      selectedSale.amount_received - selectedSale.total_amount,
                    ).toFixed(2)}
                  </span>
                </div>

                <div className="flex justify-between border-t pt-2">
                  <span className="flex items-center gap-1 text-xs font-semibold text-slate-400 uppercase">
                    <CreditCard className="h-3 w-3" /> Settlement
                  </span>
                  <span className="rounded border bg-white px-2 py-0.5 text-xs font-bold text-slate-700 capitalize shadow-sm">
                    {selectedSale.payment_method}
                  </span>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end border-t bg-slate-50 p-4">
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsDetailsOpen(false)}
                className="shadow-sm"
              >
                Close Breakdown
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
