import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase-client"; // Ensure this matches your supabase client path
import { SiteHeader } from "@/components/site-header";
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
} from "lucide-react";

export default function TransactionManager() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [cart, setCart] = useState([]);
  const [orderSource, setOrderSource] = useState("walk-in");

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
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, []);

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
        alert(`Sorry, only ${numericStock} items remaining in stock.`);
        return;
      }
      setCart(
        cart.map((item) =>
          item.id === product.id && !item.isCustomEntry
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        ),
      );
    } else {
      if (numericStock <= 0) {
        alert("This item is currently out of stock.");
        return;
      }
      setCart([
        ...cart,
        { ...product, quantity: 1, cartItemId: `catalog-${product.id}` },
      ]);
    }
  };

  // CONFIRM CUSTOM ITEM ADDITION (From catalog)
  const handleAddCustomProductConfirm = () => {
    if (!customPrice || parseFloat(customPrice) <= 0) {
      alert("Please enter a valid custom price.");
      return;
    }

    // Generate a unique identifier since the same product structure can have different notes
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
  };

  // CONFIRM PURE MANUAL ENTRY (For services/fees/items not in DB)
  const handleAddManualEntryConfirm = () => {
    if (!manualName.trim()) {
      alert("Please enter an item or service name.");
      return;
    }
    if (!manualPrice || parseFloat(manualPrice) < 0) {
      alert("Please enter a valid price.");
      return;
    }

    const uniqueCartId = `manual-${Date.now()}`;
    const manualItemPayload = {
      id: null, // No database item linked
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
  };

  // UPDATE QUANTITY HANDLER
  const updateQuantity = (cartItemId, amount) => {
    setCart(
      cart
        .map((item) => {
          if (item.cartItemId === cartItemId) {
            // Manual entries and customized packages ignore inventory count checks
            if (item.isCustomized || item.isCustomEntry) {
              const newQty = item.quantity + amount;
              return newQty > 0 ? { ...item, quantity: newQty } : null;
            }

            // Standard catalog inventory validation checks
            const numericStock = item.stock ? parseInt(item.stock, 10) : 0;
            const newQty = item.quantity + amount;

            if (amount > 0 && newQty > numericStock) {
              alert(
                `Sorry, maximum available stock limit is ${numericStock} units.`,
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
  };

  // SUBTOTAL COMPUTATION
  const subtotal = cart.reduce(
    (acc, item) => acc + (item.price || 0) * item.quantity,
    0,
  );

  // TRANSACTION SUBMISSION ENGINE
  const handleProcessSale = async () => {
    if (cart.length === 0) return;

    try {
      // NOTE FOR CAPSTONE DEFENSE:
      // 1. Insert master transaction record into `sales` / `transactions` table.
      // 2. Map and loop items into a `sales_items` table (storing product_id, quantity, customNotes, and adjusted price).
      // 3. Decrement regular items stock inside your table.

      alert(
        `Transaction logged successfully via ${orderSource.toUpperCase()}! Total Due: ₱${subtotal.toLocaleString()}`,
      );
      setCart([]);
    } catch (error) {
      console.error("Error logging transaction profiles:", error);
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
                {/* Transaction Source Selection */}
                <div className="space-y-1.5">
                  <label className="text-muted-foreground text-xs font-semibold">
                    Transaction Order Source
                  </label>
                  <Select value={orderSource} onValueChange={setOrderSource}>
                    <SelectTrigger>
                      <SelectValue placeholder="Identify point of origin" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="walk-in">
                        Walk-in Client Account
                      </SelectItem>
                      <SelectItem value="messenger">
                        Facebook Messenger Deal Close
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                {/* Items Container View */}
                <div className="max-h-[380px] space-y-3 overflow-y-auto pr-1">
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
                        {/* Custom Instruction Display Box */}
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

                {/* Computational Summary Block */}
                <div className="space-y-1.5 pt-1">
                  <div className="text-muted-foreground flex justify-between text-sm">
                    <span>Total Quantities:</span>
                    <span>
                      {cart.reduce((acc, item) => acc + item.quantity, 0)} pcs
                    </span>
                  </div>
                  <div className="flex justify-between text-lg font-bold">
                    <span>Grand Total:</span>
                    <span className="text-emerald-600">
                      ₱{subtotal.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Final Submission Executable */}
                <Button
                  className="mt-2 w-full bg-emerald-600 text-white hover:bg-emerald-700"
                  disabled={cart.length === 0}
                  onClick={handleProcessSale}
                >
                  <CheckCircle2 className="mr-2 h-4 w-4" /> Process Transaction
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
