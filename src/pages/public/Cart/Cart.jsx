import { useState } from "react";
import { useCart } from "@/hooks/useCart";
import { supabase } from "@/lib/supabase-client";
import { Button } from "@/components/ui/button";

export default function Cart({ isOpen, onClose }) {
  const { cartItems, removeFromCart, updateQuantity, clearCart } = useCart();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Bagong states para sa Guest Customer Information
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [messengerLink, setMessengerLink] = useState("");

  // Compute total price
  const cartTotal = cartItems.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0,
  );

  const handleCheckout = async (e) => {
    e.preventDefault(); // Pigilan ang page refresh dahil nasa loob ito ng <form>

    if (cartItems.length === 0 || isSubmitting) return;

    // Validation: Siguraduhing may pangalan at phone kahit guest sila
    if (!customerName.trim() || !customerPhone.trim()) {
      alert(
        "Pakisagutan ang iyong Pangalan at Phone Number para sa pag-verify ng order.",
      );
      return;
    }

    setIsSubmitting(true);

    // 1. Generate Custom Unique Reference Number
    const uniqueId = Math.floor(1000 + Math.random() * 9000);
    const refNumber = `AGS-${new Date().getFullYear()}-${uniqueId}`;

    try {
      // 2. I-save sa Orders table kasama ang detalye ng Guest Customer
      const { error } = await supabase.from("orders").insert([
        {
          reference_number: refNumber,
          total_amount: cartTotal,
          status: "pending",
          customer_name: customerName.trim(),
          customer_phone: customerPhone.trim(),
          messenger_link: messengerLink.trim() || null, // Optional ito kung walang maibigay
          items: cartItems.map((item) => ({
            product_id: item.id,
            product_name: item.product_name,
            quantity: item.quantity,
            price: item.price,
          })),
        },
      ]);

      if (error) throw error;

      // 3. I-compile ang message summary para sa customer
      let itemSummary = "";
      cartItems.forEach((item) => {
        itemSummary += `• ${item.product_name} (${item.quantity}x) - ₱${(item.price * item.quantity).toLocaleString()}\n`;
      });

      const messageToCopy = `Hi Arafel's Gift Shop! Requesting payment details for my order:\n\n👤 **Customer Info**:\nName: ${customerName.trim()}\nPhone: ${customerPhone.trim()}\n\n📋 **Order Summary**:\n${itemSummary}\n📌 Ref No: ${refNumber}\n💰 Total Amount: ₱${cartTotal.toLocaleString()}\n\nNaka-copy na po ang aking order details. Pa-confirm naman po ng order ko. Salamat!`;

      // 4. Copy to Clipboard and Open Messenger
      await navigator.clipboard.writeText(messageToCopy);
      alert(
        "🛒 Order summary and Reference Number copied to clipboard! Opening Facebook Messenger. Just paste your message in the chat box!",
      );

      // Linisin ang mga input states matapos ang matagumpay na checkout
      setCustomerName("");
      setCustomerPhone("");
      setMessengerLink("");
      clearCart();
      if (onClose) onClose();

      window.open("https://m.me/100095630491878", "_blank");
    } catch (err) {
      console.error("Checkout process failed:", err);
      alert("May nagkaproblema sa pagproseso ng order. Pakisubukan muli.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden font-[inter]">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="absolute inset-y-0 right-0 flex max-w-full pl-10">
        <div className="flex h-full w-screen max-w-md transform flex-col bg-white p-6 text-neutral-800 shadow-2xl transition-all dark:bg-neutral-950 dark:text-neutral-50">
          {/* Header */}
          <div className="flex items-center justify-between border-b pb-4 dark:border-neutral-800">
            <h2 className="text-xl font-bold tracking-tight">
              Your Shopping Cart
            </h2>
            <button
              onClick={onClose}
              className="rounded-md p-2 text-neutral-400 hover:text-neutral-500"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Main Scrollable Content */}
          <div className="flex-1 space-y-6 overflow-y-auto py-4 pr-1">
            {/* Items List Section */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold tracking-wider text-gray-400 uppercase">
                Items In Cart
              </h3>
              {cartItems.length === 0 ? (
                <div className="flex h-40 flex-col items-center justify-center text-neutral-400">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="mb-2 h-10 w-10 stroke-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                    />
                  </svg>
                  <p className="text-sm">Your cart is empty.</p>
                </div>
              ) : (
                cartItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex gap-4 rounded-xl border border-neutral-100 bg-neutral-50 p-3 dark:border-neutral-800/50 dark:bg-neutral-900/40"
                  >
                    <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg border bg-white dark:border-neutral-800 dark:bg-neutral-900">
                      <img
                        src={
                          item.thumbnail || "https://via.placeholder.com/150"
                        }
                        alt={item.product_name}
                        className="h-full w-full object-cover"
                      />
                    </div>

                    <div className="flex flex-1 flex-col justify-between">
                      <div>
                        <div className="flex justify-between text-sm font-semibold">
                          <h3 className="line-clamp-1">{item.product_name}</h3>
                          <p className="ml-4">
                            ₱{(item.price * item.quantity).toLocaleString()}
                          </p>
                        </div>
                        <p className="mt-0.5 text-[11px] text-neutral-400">
                          ₱{item.price.toLocaleString()} bawat isa
                        </p>
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <div className="flex items-center gap-1 rounded-lg border bg-white p-0.5 dark:border-neutral-800 dark:bg-neutral-950">
                          <button
                            type="button"
                            onClick={() =>
                              updateQuantity(item.id, -1, item.stock)
                            }
                            className="rounded px-1.5 py-0.5 text-xs font-bold hover:bg-neutral-100 dark:hover:bg-neutral-900"
                          >
                            -
                          </button>
                          <span className="w-5 text-center text-xs font-semibold">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              updateQuantity(item.id, 1, item.stock)
                            }
                            className="rounded px-1.5 py-0.5 text-xs font-bold hover:bg-neutral-100 dark:hover:bg-neutral-900"
                          >
                            +
                          </button>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFromCart(item.id)}
                          className="text-[11px] font-medium text-rose-600 hover:underline dark:text-rose-400"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Guest Customer Details Form Section */}
            {cartItems.length > 0 && (
              <form
                id="checkoutForm"
                onSubmit={handleCheckout}
                className="space-y-4 border-t pt-4 dark:border-neutral-800"
              >
                <h3 className="text-xs font-bold tracking-wider text-gray-400 uppercase">
                  Guest Information
                </h3>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-neutral-600 dark:text-neutral-300">
                    Pangalan (Full Name) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Juan Dela Cruz"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full rounded-lg border border-neutral-200 bg-white p-2.5 text-sm transition outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 dark:border-neutral-800 dark:bg-neutral-900"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-neutral-600 dark:text-neutral-300">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. 09123456789"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full rounded-lg border border-neutral-200 bg-white p-2.5 text-sm transition outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 dark:border-neutral-800 dark:bg-neutral-900"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-neutral-600 dark:text-neutral-300">
                    Messenger Profile Link{" "}
                    <span className="font-normal text-gray-400">
                      (Optional)
                    </span>
                  </label>
                  <input
                    type="url"
                    placeholder="e.g. https://facebook.com/johndoe"
                    value={messengerLink}
                    onChange={(e) => setMessengerLink(e.target.value)}
                    className="w-full rounded-lg border border-neutral-200 bg-white p-2.5 text-sm transition outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 dark:border-neutral-800 dark:bg-neutral-900"
                  />
                </div>
              </form>
            )}
          </div>

          {/* Checkout Footer Area */}
          {cartItems.length > 0 && (
            <div className="space-y-4 border-t pt-4 dark:border-neutral-800">
              <div className="flex justify-between text-base font-bold">
                <span>Subtotal</span>
                <span className="text-lg text-neutral-950 dark:text-white">
                  ₱{cartTotal.toLocaleString()}
                </span>
              </div>
              <p className="text-xs leading-normal text-neutral-400">
                Ang iyong pangalan, contact, at order details ay awtomatikong
                makokopya bago magbukas ang direct chat sa Messenger.
              </p>
              <Button
                type="submit"
                form="checkoutForm" // Ikinabit natin sa form sa itaas para gumana ang html5 validation
                disabled={isSubmitting}
                className="w-full rounded-xl bg-blue-600 py-6 font-semibold text-white shadow-lg transition-all hover:bg-blue-700"
              >
                {isSubmitting ? "Saving Order..." : "Checkout via Messenger"}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
