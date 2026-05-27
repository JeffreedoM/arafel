import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase-client"; // Ensure this matches your supabase client path
import { SiteHeader } from "@/components/site-header";
import { useSnackbar } from "notistack"; // 👈 Inimport ang Notistack Hook
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
import { Textarea } from "@/components/ui/textarea";
import {
  ShoppingBag,
  Search,
  Plus,
  Minus,
  Trash2,
  CheckCircle2,
  Wand2,
  Keyboard,
  Coins,
} from "lucide-react";

export default function TransactionManager() {
  const { enqueueSnackbar, closeSnackbar } = useSnackbar(); // 👈 Ininitialize ang snackbar functions

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [cart, setCart] = useState([]);

  // Database Field States
  const [orderSource, setOrderSource] = useState("walk-in");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [transactionNotes, setTransactionNotes] = useState("");

  // Calculator / Change States
  const [amountReceived, setAmountReceived] = useState("");

  // State handles for Customization Modal (For catalog items)
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);
  const [selectedProductForCustom, setSelectedProductForCustom] =
    useState(null);
  const [customNotes, setCustomNotes] = useState("");
  const [customPrice, setCustomPrice] = useState("");

  // State handles for Pure Manual Entry Modal (For items not in database)
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [manualName, setManualName] = useState("");
  const [manualPrice, setManualPrice] = useState("");
  const [manualNotes, setManualNotes] = useState("");

  // for submission
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 1. FETCH REAL DATA FROM SUPABASE
  useEffect(() => {
    async function fetchProducts() {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("products")
          .select(
            `
            id,
            product_name,
            product_description,
            price,
            stock,
            status,
            price_description,
            product_categories (
              category_name
            )
          `,
          )
          .order("product_name", { ascending: true });

        if (error) throw error;
        setProducts(data || []);
      } catch (error) {
        console.error("Error fetching products:", error.message);
        enqueueSnackbar("Failed to fetch products registry from server.", {
          variant: "error",
        });
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, [enqueueSnackbar]);

  // Filter items via search query
  const filteredProducts = products.filter((product) =>
    product.product_name?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // ADD PRODUCT TO CART
  const addToCart = (product) => {
    const numericStock = product.stock ? parseInt(product.stock, 10) : 0;
    const isCustomizable =
      isNaN(numericStock) || product.stock === null || product.stock === "";

    // IF ITEM IS CUSTOMIZABLE: Open customization input form instead of adding instantly
    if (isCustomizable) {
      setSelectedProductForCustom(product);
      setCustomPrice(product.price || "");
      setCustomNotes("");
      setIsCustomModalOpen(true);
      return;
    }

    // IF STANDARD ITEM: Check inventory boundaries
    const existingItem = cart.find(
      (item) => item.id === product.id && !item.isCustomEntry,
    );
    if (existingItem) {
      if (existingItem.quantity >= numericStock) {
        // 👈 Mas propesyonal na Notification Alert
        enqueueSnackbar(
          `Stock Boundary limit! Only ${numericStock} units left for this item.`,
          {
            variant: "warning",
          },
        );
        return;
      }
      setCart(
        cart.map((item) =>
          item.id === product.id && !item.isCustomEntry
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        ),
      );
      enqueueSnackbar(`Increased quantity for ${product.product_name}.`, {
        variant: "success",
        autoHideDuration: 1500,
      });
    } else {
      if (numericStock <= 0) {
        enqueueSnackbar(
          "Operation Denied: This catalog item is completely out of stock.",
          {
            variant: "error",
          },
        );
        return;
      }
      setCart([
        ...cart,
        { ...product, quantity: 1, cartItemId: `catalog-${product.id}` },
      ]);
      enqueueSnackbar(`${product.product_name} added to cart counter.`, {
        variant: "success",
        autoHideDuration: 1500,
      });
    }
  };

  // CONFIRM CUSTOM ITEM ADDITION (From catalog)
  const handleAddCustomProductConfirm = () => {
    if (!customPrice || parseFloat(customPrice) <= 0) {
      enqueueSnackbar(
        "Validation Alert: Please assign a proper value logic for the custom price.",
        {
          variant: "warning",
        },
      );
      return;
    }

    const uniqueCartId = `custom-${selectedProductForCustom.id}-${Date.now()}`;

    const customItemPayload = {
      ...selectedProductForCustom,
      price: parseFloat(customPrice),
      customNotes: customNotes || "No specific instructions provided.",
      isCustomized: true,
      quantity: 1,
      cartItemId: uniqueCartId,
    };

    setCart([...cart, customItemPayload]);
    setIsCustomModalOpen(false);
    setSelectedProductForCustom(null);
    enqueueSnackbar("Custom configurations appended to order listing.", {
      variant: "success",
    });
  };

  // CONFIRM PURE MANUAL ENTRY (For services/fees/items not in DB)
  const handleAddManualEntryConfirm = () => {
    if (!manualName.trim()) {
      enqueueSnackbar(
        "Required Field: Please declare a label/name for the custom entry.",
        {
          variant: "warning",
        },
      );
      return;
    }
    if (!manualPrice || parseFloat(manualPrice) < 0) {
      enqueueSnackbar(
        "Validation Alert: Price fields cannot contain negative numbers or blank characters.",
        {
          variant: "warning",
        },
      );
      return;
    }

    const uniqueCartId = `manual-${Date.now()}`;
    const manualItemPayload = {
      id: null,
      product_name: manualName,
      price: parseFloat(manualPrice),
      customNotes: manualNotes || "Manual layout override entry.",
      isCustomized: true,
      isCustomEntry: true,
      stock: "N/A",
      quantity: 1,
      cartItemId: uniqueCartId,
      product_categories: { category_name: "Manual Entry" },
    };

    setCart([...cart, manualItemPayload]);
    setIsManualModalOpen(false);
    setManualName("");
    setManualPrice("");
    setManualNotes("");
    enqueueSnackbar(
      "Manual workflow override line injected into active counter.",
      { variant: "info" },
    );
  };

  // UPDATE QUANTITY HANDLER
  const updateQuantity = (cartItemId, amount) => {
    setCart(
      cart
        .map((item) => {
          if (item.cartItemId === cartItemId) {
            if (item.isCustomized || item.isCustomEntry) {
              const newQty = item.quantity + amount;
              return newQty > 0 ? { ...item, quantity: newQty } : null;
            }

            const numericStock = item.stock ? parseInt(item.stock, 10) : 0;
            const newQty = item.quantity + amount;

            if (amount > 0 && newQty > numericStock) {
              enqueueSnackbar(
                `Cannot exceed absolute warehouse limits (${numericStock} units).`,
                {
                  variant: "warning",
                },
              );
              return item;
            }
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean),
    );
  };

  // REMOVE ITEM FROM CART
  const removeFromCart = (cartItemId) => {
    setCart(cart.filter((item) => item.cartItemId !== cartItemId));
    enqueueSnackbar("Line item removed from active counter list.", {
      variant: "neutral",
      autoHideDuration: 2000,
    });
  };

  // SUBTOTAL COMPUTATION
  const subtotal = cart.reduce(
    (acc, item) => acc + (item.price || 0) * item.quantity,
    0,
  );

  // Ilagay ito malapit sa "subtotal" constant
  const parsedAmountReceived = parseFloat(amountReceived) || 0;
  const changeAmount = Math.max(0, parsedAmountReceived - subtotal);
  const isCashValid =
    paymentMethod === "cash"
      ? amountReceived !== "" && parsedAmountReceived >= subtotal
      : true;

  // TRANSACTION SUBMISSION ENGINE
  const handleProcessSale = async () => {
    if (cart.length === 0) return;

    // Validation para sa kulang na bayad kapag cash
    if (
      paymentMethod === "cash" &&
      (!amountReceived || parsedAmountReceived < subtotal)
    ) {
      enqueueSnackbar(
        "Validation Error: Please enter a valid amount received (at least ₱" +
          subtotal.toLocaleString() +
          ")",
        {
          variant: "error",
        },
      );
      return;
    }

    const actionKey = enqueueSnackbar(
      "Synchronizing transaction lifecycle payloads with database rows...",
      {
        variant: "info",
        persist: true, // Hindi mawawala hangga't hindi natin tinatawag ang closeSnackbar
      },
    );

    try {
      setIsSubmitting(true);

      // =========================
      // 1. CREATE MASTER SALE
      // =========================
      const { data: saleData, error: saleError } = await supabase
        .from("sales")
        .insert([
          {
            total_amount: subtotal,
            order_source: orderSource,
            payment_method: paymentMethod, // 👈 Pinasa na ang napiling payment method
            notes: transactionNotes || null, // 👈 Pinasa na ang transaction notes
            amount_received:
              paymentMethod === "cash" ? parsedAmountReceived : subtotal,
          },
        ])
        .select()
        .single();

      if (saleError) throw saleError;

      const saleId = saleData.id;

      // =========================
      // 2. PREPARE SALES ITEMS
      // =========================
      const salesItemsPayload = cart.map((item) => ({
        sales_id: saleId,
        product_id: item.id || null,
        product_name: item.product_name,
        quantity: item.quantity,
        unit_price: item.price,
        custom_notes: item.customNotes || null,
        is_manual_entry: item.isCustomEntry || false, // Inugnay sa field ng schema mo
      }));

      // =========================
      // 3. INSERT SALES ITEMS
      // =========================
      const { error: salesItemsError } = await supabase
        .from("sales_items")
        .insert(salesItemsPayload);

      if (salesItemsError) throw salesItemsError;

      // =========================
      // 4. UPDATE STOCKS
      // =========================
      for (const item of cart) {
        if (item.isCustomEntry || item.isCustomized || !item.id) {
          continue;
        }

        const numericStock = parseInt(item.stock, 10);
        const newStock = numericStock - item.quantity;

        const { error: stockError } = await supabase
          .from("products")
          .update({ stock: newStock })
          .eq("id", item.id);

        if (stockError) throw stockError;
      }

      // =========================
      // SUCCESS WORKFLOW
      // =========================
      closeSnackbar(actionKey); // 👈 Isara ang loading notification

      enqueueSnackbar(
        `Transaction Processed! Sale ID: ${saleId} • Total: ₱${subtotal.toLocaleString()}`,
        {
          variant: "success",
          autoHideDuration: 6000,
        },
      );

      // Reset states on success
      setCart([]);
      setAmountReceived("");
      setTransactionNotes("");
    } catch (error) {
      console.error("Transaction Error:", error);
      closeSnackbar(actionKey); // 👈 Isara ang loading notification kung may sumabog

      enqueueSnackbar(
        `Pipeline Error: ${error.message || "Failed to commit logs"}`,
        {
          variant: "error",
          persist: true,
        },
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <SiteHeader title="Sales Register" />

      <div className="bg-muted/20 flex flex-1 flex-col space-y-6 p-4 md:p-6">
        {/* Top Operational bar for manual configurations */}
        <div className="bg-card flex flex-wrap items-center justify-between gap-4 rounded-xl border p-4 shadow-sm">
          <div>
            <h3 className="text-base font-semibold">Workspace Shortcuts</h3>
            <p className="text-muted-foreground text-xs">
              Instantly handle requests not standard in your basic inventory
              data rows.
            </p>
          </div>
          <Button
            onClick={() => setIsManualModalOpen(true)}
            className="flex h-9 items-center gap-2 bg-blue-600 text-xs text-white hover:bg-blue-700"
          >
            <Keyboard className="h-4 w-4" /> Manual / Custom Line Entry
          </Button>
        </div>

        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-3">
          {/* LEFT COLUMN: Catalog Item Options Grid */}
          <div className="space-y-4 lg:col-span-2">
            <Card className="shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle>Product Catalog</CardTitle>
                <CardDescription>
                  Select products below to add them to the ongoing terminal
                  order list.
                </CardDescription>
                <div className="relative mt-2">
                  <Search className="text-muted-foreground absolute top-2.5 left-2.5 h-4 w-4" />
                  <Input
                    type="search"
                    placeholder="Search standard products registry..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-muted-foreground py-8 text-center text-sm">
                    Connecting to secure database pipelines...
                  </div>
                ) : filteredProducts.length === 0 ? (
                  <div className="text-muted-foreground py-8 text-center text-sm">
                    No matching products found.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {filteredProducts.map((product) => {
                      const categoryName =
                        product.product_categories?.category_name ||
                        "Uncategorized";
                      const numericStock = product.stock
                        ? parseInt(product.stock, 10)
                        : 0;
                      const isCustomizable =
                        isNaN(numericStock) ||
                        product.stock === null ||
                        product.stock === "";

                      return (
                        <div
                          key={product.id}
                          className="hover:bg-muted/50 flex cursor-pointer flex-col justify-between rounded-xl border p-4 transition-colors"
                          onClick={() => addToCart(product)}
                        >
                          <div>
                            <div className="mb-1 flex items-center justify-between gap-2">
                              <Badge
                                variant="outline"
                                className="max-w-[120px] truncate text-xs"
                              >
                                {categoryName}
                              </Badge>
                              {isCustomizable ? (
                                <Badge className="flex shrink-0 items-center gap-1 bg-blue-500 text-white hover:bg-blue-600">
                                  <Wand2 className="h-2.5 w-2.5" /> Customizable
                                </Badge>
                              ) : (
                                <Badge
                                  className="shrink-0"
                                  variant={
                                    numericStock <= 5
                                      ? "destructive"
                                      : "secondary"
                                  }
                                >
                                  Stock: {product.stock}
                                </Badge>
                              )}
                            </div>
                            <h4 className="mt-1 line-clamp-2 text-sm font-medium">
                              {product.product_name}
                            </h4>
                            {product.price_description && (
                              <p className="text-muted-foreground mt-0.5 text-xs italic">
                                {product.price_description}
                              </p>
                            )}
                          </div>
                          <div className="mt-4 flex items-center justify-between">
                            <span className="text-primary text-base font-bold">
                              ₱
                              {product.price
                                ? product.price.toLocaleString()
                                : "0"}
                            </span>
                            <Button
                              size="sm"
                              variant="secondary"
                              className="h-8 w-8 p-0"
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* RIGHT COLUMN: Interactive Cart Overview and Source Actions */}
          <div className="space-y-4">
            <Card className="border-primary/20 bg-card shadow-sm">
              <CardHeader className="pb-3">
                <div className="text-primary flex items-center gap-2">
                  <ShoppingBag className="h-5 w-5" />
                  <CardTitle>Current Order Terminal</CardTitle>
                </div>
                <CardDescription>
                  Review active line totals processed by the checkout counter.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Flow Control Inputs */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-muted-foreground text-[11px] font-semibold tracking-wider uppercase">
                      Order Source
                    </label>
                    <Select value={orderSource} onValueChange={setOrderSource}>
                      <SelectTrigger className="h-9 text-xs">
                        <SelectValue placeholder="Identify point of origin" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="walk-in">Walk-in Client</SelectItem>
                        <SelectItem value="messenger">FB Messenger</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-muted-foreground text-[11px] font-semibold tracking-wider uppercase">
                      Payment Method
                    </label>
                    <Select
                      value={paymentMethod}
                      onValueChange={(val) => {
                        setPaymentMethod(val);
                        if (val !== "cash") setAmountReceived(""); // I-reset kapag hindi cash
                      }}
                    >
                      <SelectTrigger className="h-9 text-xs">
                        <SelectValue placeholder="Method" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cash">Cash</SelectItem>
                        <SelectItem value="gcash">GCash</SelectItem>
                        <SelectItem value="maya">Maya</SelectItem>
                        <SelectItem value="bank">Bank Transfer</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Separator />

                {/* Items Container View */}
                <div className="max-h-[260px] space-y-3 overflow-y-auto pr-1">
                  {cart.length === 0 ? (
                    <div className="text-muted-foreground py-8 text-center text-sm">
                      Terminal empty. Add items from catalog or create custom
                      logs.
                    </div>
                  ) : (
                    cart.map((item) => (
                      <div
                        key={item.cartItemId}
                        className="flex flex-col gap-1 border-b pb-2 last:border-0 last:pb-0"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <h5 className="flex items-center gap-1 truncate text-sm font-medium">
                              {item.product_name}
                              {item.isCustomized && (
                                <span className="rounded border border-blue-200 bg-blue-50 px-1 text-[10px] font-bold text-blue-500">
                                  CUSTOM
                                </span>
                              )}
                            </h5>
                            <p className="text-muted-foreground text-xs">
                              ₱{item.price ? item.price.toLocaleString() : "0"}{" "}
                              each
                            </p>
                          </div>
                          <div className="flex shrink-0 items-center gap-1.5">
                            <Button
                              size="icon"
                              variant="outline"
                              className="h-6 w-6"
                              onClick={() =>
                                updateQuantity(item.cartItemId, -1)
                              }
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="w-6 text-center text-sm font-semibold">
                              {item.quantity}
                            </span>
                            <Button
                              size="icon"
                              variant="outline"
                              className="h-6 w-6"
                              onClick={() => updateQuantity(item.cartItemId, 1)}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="text-destructive hover:bg-destructive/10 h-6 w-6"
                              onClick={() => removeFromCart(item.cartItemId)}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>
                        {item.customNotes && (
                          <div className="bg-muted/50 text-muted-foreground mt-1 rounded border border-dashed p-1.5 text-[11px]">
                            <span className="font-semibold text-neutral-600">
                              Specs:{" "}
                            </span>
                            {item.customNotes}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>

                <Separator />

                {/* Calculator & Change Block */}
                <div className="bg-muted/30 space-y-2.5 rounded-xl border p-3">
                  <div className="text-muted-foreground flex justify-between text-xs">
                    <span>Total Quantities:</span>
                    <span className="text-foreground font-medium">
                      {cart.reduce((acc, item) => acc + item.quantity, 0)} pcs
                    </span>
                  </div>

                  <div className="flex justify-between border-b pb-2 text-base font-bold">
                    <span>Grand Total:</span>
                    <span className="text-emerald-600">
                      ₱{subtotal.toLocaleString()}
                    </span>
                  </div>

                  {/* Dynamic Cash Calculator Inputs */}
                  {paymentMethod === "cash" && (
                    <div className="space-y-2 pt-1">
                      <div className="flex items-center justify-between gap-2">
                        <label className="text-muted-foreground flex items-center gap-1 text-xs font-medium">
                          <Coins className="h-3 w-3" /> Amount Received:
                        </label>
                        <div className="relative w-32">
                          <span className="text-muted-foreground absolute top-1.5 left-2 text-xs">
                            ₱
                          </span>
                          <Input
                            type="number"
                            required
                            placeholder="0.00"
                            className="h-7 pl-5 text-right text-xs font-semibold"
                            value={amountReceived}
                            onChange={(e) => setAmountReceived(e.target.value)}
                            disabled={cart.length === 0}
                          />
                        </div>
                      </div>

                      {parsedAmountReceived > 0 && (
                        <div className="bg-background flex items-center justify-between rounded-lg border px-2.5 py-1.5 text-xs">
                          <span className="text-muted-foreground font-medium">
                            Computed Change:
                          </span>
                          <span
                            className={`text-sm font-bold ${parsedAmountReceived < subtotal ? "text-destructive" : "text-blue-600"}`}
                          >
                            {parsedAmountReceived < subtotal
                              ? `Short: ₱${(subtotal - parsedAmountReceived).toLocaleString()}`
                              : `₱${changeAmount.toLocaleString()}`}
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Transaction Level Notes Form Input */}
                  <div className="space-y-1 pt-1">
                    <label className="text-muted-foreground text-[10px] font-semibold tracking-wide uppercase">
                      Transaction Notes / Internal Memo
                    </label>
                    <Textarea
                      placeholder="Optional layout override instructions, tracking markers, etc..."
                      className="min-h-[40px] resize-none p-1.5 text-xs"
                      value={transactionNotes}
                      onChange={(e) => setTransactionNotes(e.target.value)}
                    />
                  </div>
                </div>

                {/* Final Submission Executable */}
                <Button
                  className="w-full bg-emerald-600 text-white hover:bg-emerald-700"
                  disabled={
                    cart.length === 0 || isSubmitting || !isCashValid // 👈 Dito ayun, ma-di-disable kung invalid ang cash
                  }
                  onClick={handleProcessSale}
                >
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  {isSubmitting ? "Processing..." : "Process Transaction"}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* MODAL A: Customization Specifications Form for Catalog Products */}
      <Dialog open={isCustomModalOpen} onOpenChange={setIsCustomModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-1.5 text-blue-600">
              <Wand2 className="h-5 w-5" /> Customize Item Specifications
            </DialogTitle>
            <DialogDescription>
              Configure specific sizing details, add-on costs, and instruction
              notes for{" "}
              <strong>{selectedProductForCustom?.product_name}</strong>.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label className="text-right text-sm font-medium">
                Final Price (₱)
              </label>
              <Input
                type="number"
                className="col-span-3"
                value={customPrice}
                onChange={(e) => setCustomPrice(e.target.value)}
                placeholder="Enter final computed price"
              />
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <label className="mt-2 text-right text-sm font-medium">
                Custom Specs
              </label>
              <Textarea
                className="col-span-3 min-h-[80px]"
                placeholder="e.g., Pink wrapping paper, include standard dedication greeting card reading 'Happy Anniversary Mom and Dad'"
                value={customNotes}
                onChange={(e) => setCustomNotes(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCustomModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              className="bg-blue-600 text-white hover:bg-blue-700"
              onClick={handleAddCustomProductConfirm}
            >
              Add Customized Line
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* MODAL B: Pure Manual / Override Entry Form */}
      <Dialog open={isManualModalOpen} onOpenChange={setIsManualModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-1.5 text-neutral-800">
              <Keyboard className="h-5 w-5" /> Manual Line Item Entry
            </DialogTitle>
            <DialogDescription>
              Directly input generic orders, custom arrangement configurations,
              or manual packaging charges not existing inside tables.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label className="text-right text-sm font-medium">
                Item Name
              </label>
              <Input
                type="text"
                className="col-span-3"
                placeholder="e.g., Styrofoam Carving Lettering / Custom Box Set"
                value={manualName}
                onChange={(e) => setManualName(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label className="text-right text-sm font-medium">
                Unit Price (₱)
              </label>
              <Input
                type="number"
                className="col-span-3"
                placeholder="0.00"
                value={manualPrice}
                onChange={(e) => setManualPrice(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <label className="mt-2 text-right text-sm font-medium">
                Item Specs
              </label>
              <Textarea
                className="col-span-3 min-h-[70px]"
                placeholder="Add contextual details here..."
                value={manualNotes}
                onChange={(e) => setManualNotes(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsManualModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              className="bg-neutral-800 text-white hover:bg-neutral-900"
              onClick={handleAddManualEntryConfirm}
            >
              Inject Line To Order
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
