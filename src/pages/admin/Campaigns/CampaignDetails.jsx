import { useEffect, useState } from "react";
import { useParams, Link } from "react-router";
import { supabase } from "@/lib/supabase-client";
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
import { useSnackbar } from "notistack";
import {
  ArrowLeft,
  Save,
  Percent,
  Loader2,
  Package,
  Calendar,
} from "lucide-react";

export default function CampaignDetails() {
  const { id } = useParams();
  const { enqueueSnackbar } = useSnackbar();

  const [campaign, setCampaign] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);

  // 1. Kukunin ang detalye ng Campaign kasama ang relational matching sa products table
  const fetchCampaignDetails = async () => {
    try {
      setLoading(true);

      // Kunin ang campaign metadata
      const { data: campaignData, error: campaignError } = await supabase
        .from("campaigns")
        .select("id, campaign_name, date_start, date_end")
        .eq("id", id)
        .single();

      if (campaignError) throw campaignError;
      setCampaign(campaignData);

      // Kunin ang junction rows gamit ang mga tamang fields base sa iyong database schema
      const { data: pivotData, error: pivotError } = await supabase
        .from("campaign_products")
        .select(
          `
          id,
          product_id,
          promo_price,
          products (
            id,
            product_name,
            price,
            stock
          )
        `,
        )
        .eq("campaign_id", id);

      if (pivotError) throw pivotError;

      // I-format ang local state para madaling hawakan ng controlled components/inputs
      const formattedProducts = pivotData.map((item) => {
        const original = item.products?.price || 0;
        return {
          campaignProductId: item.id,
          productId: item.product_id,
          name: item.products?.product_name || "Unknown Product", // Binago base sa schema mo: product_name
          originalPrice: original,
          stock: item.products?.stock || "0", // String ang type ng stock sa schema mo
          // Kung null ang promo_price sa DB, i-default pansamantala sa original price
          promoPrice:
            item.promo_price !== null && item.promo_price !== undefined
              ? item.promo_price
              : original,
        };
      });

      setProducts(formattedProducts);
    } catch (error) {
      console.error("Error fetching campaign details:", error);
      enqueueSnackbar("Failed to load campaign details", { variant: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchCampaignDetails();
  }, [id]);

  // 2. Local State Handler tuwing may tinataype o binabago sa text field ang admin
  const handlePriceChange = (campaignProductId, value) => {
    setProducts((prevProducts) =>
      prevProducts.map((p) =>
        p.campaignProductId === campaignProductId
          ? { ...p, promoPrice: value }
          : p,
      ),
    );
  };

  // 3. Pagsasave ng Promo Price pabalik sa campaign_products junction table
  const handleSavePrice = async (item) => {
    const parsedPromoPrice = parseFloat(item.promoPrice);

    // Form validation check
    if (isNaN(parsedPromoPrice) || parsedPromoPrice < 0) {
      enqueueSnackbar("Please enter a valid non-negative price", {
        variant: "warning",
      });
      return;
    }

    if (parsedPromoPrice > item.originalPrice) {
      enqueueSnackbar(
        "Notice: Promo price is set higher than the original retail price",
        { variant: "info" },
      );
    }

    try {
      setSavingId(item.campaignProductId);

      // I-update ang bagong column sa campaign_products
      const { error } = await supabase
        .from("campaign_products")
        .update({ promo_price: parsedPromoPrice })
        .eq("id", item.campaignProductId);

      if (error) throw error;

      enqueueSnackbar(`Successfully updated promo price for ${item.name}`, {
        variant: "success",
      });

      // I-update ang local state references para magtugma ang tracking values
      setProducts((prev) =>
        prev.map((p) =>
          p.campaignProductId === item.campaignProductId
            ? { ...p, promoPrice: parsedPromoPrice }
            : p,
        ),
      );
    } catch (error) {
      console.error("Error updating promo price:", error);
      enqueueSnackbar("Failed to update price", { variant: "error" });
    } finally {
      setSavingId(null);
    }
  };

  const isCampaignActive = () => {
    if (!campaign) return false;
    const now = new Date();
    const start = new Date(campaign.date_start);
    const end = new Date(campaign.date_end);
    return now >= start && now <= end;
  };

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center gap-2">
        <Loader2 className="text-primary h-6 w-6 animate-spin" />
        <span className="text-muted-foreground text-sm">
          Loading campaign details...
        </span>
      </div>
    );
  }

  return (
    <>
      <SiteHeader title="Campaign Manager" />

      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 p-6">
        {/* Navigation Action */}
        <div className="flex items-center justify-between">
          <Button variant="outline" size="sm" asChild>
            <Link to="/admin/campaigns" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" /> Back to Campaigns
            </Link>
          </Button>

          {isCampaignActive() ? (
            <Badge
              variant="success"
              className="bg-emerald-500 px-3 py-1 text-white hover:bg-emerald-600"
            >
              ● Active Promo
            </Badge>
          ) : (
            <Badge variant="secondary" className="px-3 py-1">
              Inactive / Scheduled
            </Badge>
          )}
        </div>

        {/* Campaign Metadata Summary */}
        {campaign && (
          <Card className="border-slate-200 bg-slate-50/50 shadow-sm">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 text-primary rounded-lg p-2">
                  <Percent className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-2xl font-bold tracking-tight text-slate-800">
                    {campaign.campaign_name}
                  </CardTitle>
                  <CardDescription className="mt-1 flex items-center gap-4 text-slate-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      Start:{" "}
                      {new Date(campaign.date_start).toLocaleDateString(
                        "en-US",
                        { dateStyle: "medium" },
                      )}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      End:{" "}
                      {new Date(campaign.date_end).toLocaleDateString("en-US", {
                        dateStyle: "medium",
                      })}
                    </span>
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>
        )}

        {/* Main Products Listing Section */}
        <Card className="border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg font-semibold text-slate-800">
              <Package className="h-5 w-5 text-slate-500" />
              Campaign Products Pricing
            </CardTitle>
            <CardDescription>
              Set specific campaign prices or dynamic discounts for the selected
              items in this catalog.
            </CardDescription>
          </CardHeader>

          <CardContent>
            {products.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-xl border border-dashed bg-slate-50/50 py-12 text-center">
                <Package className="mb-2 h-8 w-8 text-slate-300" />
                <p className="text-sm font-medium text-slate-600">
                  No products selected for this campaign
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  Go back and add products to this marketing campaign first.
                </p>
              </div>
            ) : (
              <div className="relative overflow-x-auto rounded-lg border border-slate-200">
                <table className="w-full text-left text-sm text-slate-600">
                  <thead className="border-b border-slate-200 bg-slate-50 text-xs text-slate-500 uppercase">
                    <tr>
                      <th className="px-6 py-4 font-semibold">Product Name</th>
                      <th className="px-4 py-4 text-center font-semibold">
                        Stock Status
                      </th>
                      <th className="px-4 py-4 text-right font-semibold">
                        Original Price
                      </th>
                      <th className="w-[220px] px-6 py-4 text-right font-semibold">
                        Campaign Promo Price (₱)
                      </th>
                      <th className="w-[120px] px-6 py-4 text-center font-semibold">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {products.map((item) => {
                      // UX Check: Magkakaroon ng visual highlight kapag magkaiba ang input field value sa original retail price
                      const hasChanged =
                        parseFloat(item.promoPrice) !== item.originalPrice;

                      return (
                        <tr
                          key={item.campaignProductId}
                          className="transition-colors hover:bg-slate-50/50"
                        >
                          {/* Product Name */}
                          <td className="px-6 py-4 font-medium text-slate-900">
                            {item.name}
                          </td>

                          {/* Stock Counter */}
                          <td className="px-4 py-4 text-center">
                            <span className="font-mono text-xs text-slate-500">
                              {item.stock}
                            </span>
                          </td>

                          {/* Original Base Price */}
                          <td className="px-4 py-4 text-right font-mono text-slate-500">
                            ₱{Number(item.originalPrice).toFixed(2)}
                          </td>

                          {/* Interactive Price Input */}
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Input
                                type="number"
                                className={`h-9 max-w-[160px] text-right font-mono ${
                                  hasChanged
                                    ? "border-amber-400 bg-amber-50/30 font-bold text-amber-700 focus-visible:ring-amber-400"
                                    : "border-slate-200"
                                }`}
                                value={item.promoPrice}
                                onChange={(e) =>
                                  handlePriceChange(
                                    item.campaignProductId,
                                    e.target.value,
                                  )
                                }
                                min="0"
                                step="0.01"
                                placeholder="0.00"
                              />
                            </div>
                          </td>

                          {/* Trigger Update Action */}
                          <td className="px-6 py-4 text-center">
                            <Button
                              size="sm"
                              className="h-8 w-full max-w-[90px] gap-1.5"
                              disabled={savingId === item.campaignProductId}
                              onClick={() => handleSavePrice(item)}
                            >
                              {savingId === item.campaignProductId ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              ) : (
                                <>
                                  <Save className="h-3.5 w-3.5" />
                                  Save
                                </>
                              )}
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
