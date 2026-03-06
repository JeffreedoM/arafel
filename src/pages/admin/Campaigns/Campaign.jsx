import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
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
import { IconPlus, IconFolderCode } from "@tabler/icons-react";
import { useEffect, useState } from "react";

import { supabase } from "@/lib/supabase-client";

import { Link } from "react-router";
export default function Campaign() {
  const [campaigns, setCampaigns] = useState([]);

  useEffect(() => {
    const fetchCampaigns = async () => {
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
        setCampaigns(data);
        console.log("Campaigns fetched successfully:", data);
      }
    };

    fetchCampaigns();
  }, []);

  return (
    <>
      <SiteHeader title="Campaigns" />
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="container mx-auto h-full py-10">
            {campaigns.length > 0 ? (
              <div className="flex items-center justify-center gap-x-6 gap-y-2 rounded-md">
                {campaigns.map((campaign) => (
                  <Link
                    to={`${campaign.id}`}
                    key={campaign.id}
                    className="block h-50 w-56 transition-transform hover:scale-102"
                  >
                    <Card className="h-full w-full cursor-pointer">
                      <CardHeader>
                        <CardTitle>{campaign.campaign_name}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p>{campaign.description}</p>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
                {/* Add New Campaign */}
                <Link
                  to="new"
                  className="block h-50 w-56 transition-transform hover:scale-102"
                >
                  <Card className="flex h-full w-full cursor-pointer items-center justify-center">
                    <IconPlus />
                    Add Campaign
                  </Card>
                </Link>
              </div>
            ) : (
              <Empty className="h-full">
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <IconFolderCode />
                  </EmptyMedia>
                  <EmptyTitle>No Campaigns Found</EmptyTitle>
                  <EmptyDescription>
                    Add Campaign to Your Website.
                  </EmptyDescription>
                </EmptyHeader>
                <EmptyContent>
                  <Link to={"new"}>
                    <Button variant="outline" className="ml-4">
                      <IconPlus className="mr-2" /> Create Your First Campaign
                    </Button>
                  </Link>
                </EmptyContent>
              </Empty>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
