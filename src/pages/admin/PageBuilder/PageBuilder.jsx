import { useState } from "react";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";

// I-import ang iyong mga sub-sections card modules dito
import HeroSection from "./HeroSection";
import BannerSection from "./BannerSection";
import FeaturedProductsSection from "./FeaturedProductsSection";

// Icons
import { ArrowUp, ArrowDown, Layout, Save, Eye } from "lucide-react";

// 1. Ang Registry Map ng mga components mo
const HOMEPAGE_SECTIONS = {
  hero: { name: "Main Banner (Hero)", component: HeroSection },
  banner: { name: "Promotional Banner", component: BannerSection },
  featured_products: {
    name: "Featured Products Grid",
    component: FeaturedProductsSection,
  },
};

export default function PageBuilder() {
  // 2. State para sa pagkakasunod-sunod ng mga sections sa Homepage
  const [sectionOrder, setSectionOrder] = useState([
    "hero",
    "banner",
    "featured_products",
  ]);

  // 3. Functional array shifter logic para magpalit ng pwesto ang mga sections
  const moveSection = (index, direction) => {
    const updatedOrder = [...sectionOrder];
    const targetIndex = direction === "up" ? index - 1 : index + 1;

    if (targetIndex < 0 || targetIndex >= updatedOrder.length) return;

    // Swapping mechanism
    const temp = updatedOrder[index];
    updatedOrder[index] = updatedOrder[targetIndex];
    updatedOrder[targetIndex] = temp;

    setSectionOrder(updatedOrder);
  };

  // 4. Trigger kapag gusto mo nang i-save ang pagkakasunod-sunod sa Supabase
  const handleSaveLayout = async () => {
    // Dito mo pwedeng i-save ang `sectionOrder` array pabalik sa database mo
    console.log("Current Layout Structure Saved:", sectionOrder);
    alert("Homepage section arrangement saved successfully!");
  };

  return (
    <>
      <SiteHeader title="Page Builder" />

      <div className="bg-muted/20 flex min-h-[calc(100vh-4rem)] flex-1 flex-col lg:flex-row">
        {/* 🧭 LEFT SIDEBAR: Dito mo makikita at pwedeng i-sort ang pagkakasunod-sunod */}
        <div className="bg-background w-full shrink-0 space-y-6 border-r p-6 lg:w-80">
          <div>
            <h2 className="text-muted-foreground mb-1 text-sm font-semibold tracking-wider uppercase">
              Page Architecture
            </h2>
            <p className="text-muted-foreground text-xs">
              Rearrange how content layers position themselves on the live
              front-facing screen view.
            </p>
          </div>

          <div className="bg-card space-y-1 rounded-xl border p-2 shadow-sm">
            {sectionOrder.map((sectionKey, index) => {
              const itemInfo = HOMEPAGE_SECTIONS[sectionKey];
              if (!itemInfo) return null;

              return (
                <div
                  key={sectionKey}
                  className="bg-muted/40 border-muted/70 flex items-center justify-between rounded-lg border p-2 text-sm font-medium"
                >
                  <span className="flex items-center gap-2 truncate pl-1">
                    <Layout className="text-muted-foreground h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">{itemInfo.name}</span>
                  </span>

                  {/* Sorting Action Knobs */}
                  <div className="flex shrink-0 items-center gap-0.5">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      disabled={index === 0}
                      onClick={() => moveSection(index, "up")}
                    >
                      <ArrowUp className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      disabled={index === sectionOrder.length - 1}
                      onClick={() => moveSection(index, "down")}
                    >
                      <ArrowDown className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>

          <Button className="w-full gap-2 shadow-sm" onClick={handleSaveLayout}>
            <Save className="h-4 w-4" />
            Save Layout Structure
          </Button>
        </div>

        {/* 🖥️ RIGHT WORKSPACE: Dito lalabas ang mga Accordion components ayon sa bagong order */}
        <div className="flex-1 overflow-y-auto p-6 lg:p-10">
          <div className="mx-auto max-w-4xl space-y-6">
            <div className="text-muted-foreground flex items-center gap-2 border-b pb-2 text-xs font-bold tracking-wider uppercase">
              <Eye className="h-4 w-4" />
              Live Workspace Configuration Flow
            </div>

            {/* DYNAMIC COMPONENT INJECTION LOOP */}
            <div className="space-y-6">
              {sectionOrder.map((sectionKey) => {
                const ActiveComponent =
                  HOMEPAGE_SECTIONS[sectionKey]?.component;
                if (!ActiveComponent) return null;

                // I-render ang accordion panel base sa naka-sort na key array positions
                return <ActiveComponent key={sectionKey} />;
              })}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
