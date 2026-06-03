import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase-client";
import { SiteHeader } from "@/components/site-header";
import { Search, CheckCircle, XCircle, Clock, Package } from "lucide-react";

function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("pending"); // pending, completed, cancelled, all

  // Fetch orders mula sa Supabase
  const fetchOrders = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });

      // Kung may sine-search na Reference Number
      if (searchQuery.trim() !== "") {
        query = query.ilike("reference_number", `%${searchQuery.trim()}%`);
      }
      // Kung walang sine-search, i-filter base sa active tab
      else if (activeTab !== "all") {
        query = query.eq("status", activeTab);
      }

      const { data, error } = await query;
      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error("Error fetching orders:", error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [activeTab, searchQuery]);

  // Update Status Handler (Mark as Completed / Cancelled)
  const handleUpdateStatus = async (orderId, newStatus) => {
    const confirmAction = window.confirm(
      `Sigurado ka bang i-ma-mark as ${newStatus} ang order na ito?`,
    );
    if (!confirmAction) return;

    try {
      const { error } = await supabase
        .from("orders")
        .update({ status: newStatus })
        .eq("id", orderId);

      if (error) throw error;

      // I-refresh ang listahan pagkatapos mag-update
      fetchOrders();
    } catch (error) {
      alert("Failed to update status: " + error.message);
    }
  };

  return (
    <div className="bg-background text-foreground flex min-h-screen flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-7xl flex-1 space-y-6 p-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
              Orders Management
            </h1>
            <p className="text-sm text-gray-500">
              I-manage at i-verify ang mga orders ng mga guest buyers dito.
            </p>
          </div>

          {/* Search Bar */}
          <div className="relative w-full sm:w-80">
            <input
              type="text"
              placeholder="Search Reference No..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-white p-2.5 pr-4 pl-10 text-sm transition outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10"
            />
            <Search className="absolute top-3 left-3 text-gray-400" size={16} />
          </div>
        </div>

        {/* Tabs Filter */}
        <div className="flex gap-2 border-b border-gray-200 pb-px text-sm font-medium">
          {["pending", "completed", "cancelled", "all"].map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab);
                setSearchQuery(""); // Linisin ang search kapag lumipat ng tab
              }}
              className={`-mb-px border-b-2 px-4 py-2.5 capitalize transition ${
                activeTab === tab
                  ? "border-blue-600 font-semibold text-blue-600"
                  : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Orders Main Content */}
        {loading ? (
          <div className="animate-pulse py-20 text-center text-gray-500">
            Loading orders data...
          </div>
        ) : orders.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-200 bg-white py-20 text-center text-gray-400">
            <Package className="mx-auto mb-3 stroke-1" size={48} />
            <p className="text-sm">
              Walang nahanap na orders sa kategoryang ito.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {orders.map((order) => (
              <div
                key={order.id}
                className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition hover:shadow-md"
              >
                {/* Order Top Summary */}
                <div className="flex flex-col justify-between gap-2 border-b border-gray-50 pb-4 sm:flex-row sm:items-center">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="rounded-md bg-gray-100 px-2.5 py-1 font-mono text-sm font-bold text-gray-900">
                        {order.reference_number}
                      </span>
                      {order.status === "pending" && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-700">
                          <Clock size={12} /> Pending
                        </span>
                      )}
                      {order.status === "completed" && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                          <CheckCircle size={12} /> Completed
                        </span>
                      )}
                      {order.status === "cancelled" && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2 py-0.5 text-xs font-semibold text-rose-700">
                          <XCircle size={12} /> Cancelled
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400">
                      Ordered on:{" "}
                      {new Date(order.created_at).toLocaleString("en-PH")}
                    </p>
                  </div>

                  <div className="text-left sm:text-right">
                    <span className="block text-xs text-gray-400">
                      Total Amount
                    </span>
                    <span className="text-lg font-extrabold text-indigo-600">
                      ₱{Number(order.total_amount).toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Bought Items Breakdown */}
                <div className="py-4">
                  <h4 className="mb-2 text-xs font-bold tracking-wider text-gray-400 uppercase">
                    Items Ordered:
                  </h4>
                  <div className="space-y-2">
                    {Array.isArray(order.items) &&
                      order.items.map((item, idx) => (
                        <div
                          key={idx}
                          className="flex justify-between rounded-lg border border-gray-100 bg-gray-50/50 p-2 text-sm"
                        >
                          <div className="flex gap-2">
                            <span className="font-semibold text-gray-500">
                              {item.quantity}x
                            </span>
                            <span className="font-medium text-gray-700">
                              {item.product_name}
                            </span>
                          </div>
                          <span className="font-semibold text-gray-900">
                            ₱{(item.price * item.quantity).toLocaleString()}
                          </span>
                        </div>
                      ))}
                  </div>
                </div>

                {/* Admin Quick Action Buttons */}
                {order.status === "pending" && (
                  <div className="flex justify-end gap-2 border-t border-gray-50 pt-4">
                    <button
                      onClick={() => handleUpdateStatus(order.id, "cancelled")}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-4 py-2 text-xs font-semibold text-rose-600 transition hover:bg-rose-50"
                    >
                      <XCircle size={14} /> Cancel Order
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(order.id, "completed")}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-md shadow-blue-500/10 transition hover:bg-blue-700"
                    >
                      <CheckCircle size={14} /> Mark as Finished
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default Orders;
