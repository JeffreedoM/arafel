import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  IconPlus,
  IconFolderCode,
  IconCalendarEvent,
  IconBox,
  IconArrowUpRight,
} from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase-client";
import { Link } from "react-router";

export default function Campaign() {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCampaigns = async () => {
      setLoading(true);
      const { data, error } = await supabase.from("campaigns").select(`
        id,
        campaign_name,
        date_start,
        date_end,
        campaign_products (
          product_id,
          products (
            id,
            product_name
          )
        )
      `);

      if (error) {
        console.error("Error fetching campaigns:", error);
      } else {
        setCampaigns(data || []);
      }
      setLoading(false);
    };

    fetchCampaigns();
  }, []);

  // sort campaigns by active status first, then by database order (which is likely creation date)
  const sortedCampaigns = (campaigns || []).sort((a, b) => {
    const now = new Date();

    // Evaluate active configurations dynamically
    const aActive =
      now >= new Date(a.date_start) && now <= new Date(a.date_end);
    const bActive =
      now >= new Date(b.date_start) && now <= new Date(b.date_end);

    if (aActive && !bActive) return -1; // Move a higher up the list
    if (!aActive && bActive) return 1; // Move b higher up the list
    return 0; // Maintain original database sort hierarchy if states are identical
  });

  // Dynamic status badges based on system dates for the dashboard
  const getCampaignStatus = (startDate, endDate) => {
    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (now < start) {
      return (
        <Badge
          variant="secondary"
          className="border-amber-500/20 bg-amber-500/10 text-amber-500"
        >
          Upcoming
        </Badge>
      );
    } else if (now >= start && now <= end) {
      return (
        <Badge
          variant="default"
          className="border-emerald-500/20 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20"
        >
          Active Now
        </Badge>
      );
    } else {
      return (
        <Badge variant="outline" className="text-muted-foreground bg-muted/50">
          Ended
        </Badge>
      );
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <>
      <SiteHeader title="Marketing Campaigns" />
      <div className="bg-muted/20 flex-1 p-4 md:p-8">
        <div className="mx-auto max-w-7xl space-y-6">
          {/* Top Banner Control Panel Actions */}
          <div className="flex flex-col gap-4 border-b pb-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">
                Active Promotions
              </h2>
              <p className="text-muted-foreground text-sm">
                Manage your storefront highlights, active discounts, and
                seasonal gift campaigns.
              </p>
            </div>
            {campaigns.length > 0 && (
              <Link to="new">
                <Button className="shadow-sm">
                  <IconPlus className="mr-2 h-4 w-4" /> Add New Campaign
                </Button>
              </Link>
            )}
          </div>

          {/* Core Content Engine */}
          {loading ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((n) => (
                <Card key={n} className="bg-muted/40 h-56 animate-pulse" />
              ))}
            </div>
          ) : campaigns.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {campaigns.map((campaign) => (
                <Link
                  to={`${campaign.id}`}
                  key={campaign.id}
                  className="group block transition-all"
                >
                  <Card className="border-muted/60 hover:border-primary/40 relative flex h-full flex-col justify-between overflow-hidden transition-all hover:shadow-md">
                    {/* Visual Card Header */}
                    <CardHeader className="space-y-1 pb-3">
                      <div className="flex items-start justify-between gap-2">
                        {getCampaignStatus(
                          campaign.date_start,
                          campaign.date_end,
                        )}
                        <IconArrowUpRight className="text-muted-foreground h-4 w-4 opacity-0 transition-opacity group-hover:opacity-100" />
                      </div>
                      <CardTitle className="group-hover:text-primary line-clamp-1 text-lg font-bold transition-colors">
                        {campaign.campaign_name}
                      </CardTitle>
                    </CardHeader>

                    {/* Operational Details Body */}
                    <CardContent className="space-y-4 pb-4">
                      {/* Date Information row */}
                      <div className="text-muted-foreground flex items-center gap-2 text-sm">
                        <IconCalendarEvent className="text-muted-foreground/70 h-4 w-4 shrink-0" />
                        <span>
                          {formatDate(campaign.date_start)} –{" "}
                          {formatDate(campaign.date_end)}
                        </span>
                      </div>

                      {/* Associated Items/Products Tracker */}
                      <div className="text-muted-foreground flex items-center gap-2 text-sm">
                        <IconBox className="text-muted-foreground/70 h-4 w-4 shrink-0" />
                        <span>
                          {campaign.campaign_products?.length || 0} Connected{" "}
                          {campaign.campaign_products?.length === 1
                            ? "Product"
                            : "Products"}
                        </span>
                      </div>
                    </CardContent>

                    {/* Clean Footer Divider Layout */}
                    <CardFooter className="bg-muted/30 border-muted/40 text-primary flex items-center justify-between border-t px-6 py-3 text-xs font-medium">
                      <span>View Details</span>
                      <span className="text-muted-foreground font-normal">
                        ID: #{campaign.id}
                      </span>
                    </CardFooter>
                  </Card>
                </Link>
              ))}

              {/* Grid Extension: Secondary Create Prompt Card Box */}
              <Link to="new" className="group block h-full min-h-[200px]">
                <div className="border-muted-foreground/20 hover:border-primary/40 hover:bg-muted/10 flex h-full w-full cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 text-center transition-colors">
                  <div className="bg-background mb-2 rounded-full border p-3 shadow-sm transition-transform group-hover:scale-105">
                    <IconPlus className="text-muted-foreground group-hover:text-primary h-5 w-5" />
                  </div>
                  <p className="group-hover:text-primary text-sm font-semibold">
                    Create Another Campaign
                  </p>
                  <p className="text-muted-foreground mt-1 max-w-[180px] text-xs">
                    Set up overlapping promotional target sets.
                  </p>
                </div>
              </Link>
            </div>
          ) : (
            /* Redesigned Clean Empty State Structure */
            <Card className="flex min-h-[450px] items-center justify-center border-dashed p-8 text-center">
              <Empty className="max-w-md">
                <EmptyHeader>
                  <EmptyMedia
                    variant="icon"
                    className="bg-primary/10 text-primary mx-auto mb-4 rounded-full p-4"
                  >
                    <IconFolderCode className="h-8 w-8" />
                  </EmptyMedia>
                  <EmptyTitle className="text-xl font-bold">
                    No Campaigns Launched Yet
                  </EmptyTitle>
                  <EmptyDescription className="text-muted-foreground mx-auto mt-2 max-w-sm">
                    Promotional structures allow you to highlight holiday
                    bundles, discounts, and custom gift events on your public
                    page.
                  </EmptyDescription>
                </EmptyHeader>
                <EmptyContent className="mt-6">
                  <Link to="new">
                    <Button size="lg" className="shadow-sm">
                      <IconPlus className="mr-2 h-4 w-4" /> Create Your First
                      Campaign
                    </Button>
                  </Link>
                </EmptyContent>
              </Empty>
            </Card>
          )}
        </div>
      </div>
    </>
  );
}
