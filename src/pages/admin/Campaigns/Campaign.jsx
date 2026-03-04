import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { IconPlus } from "@tabler/icons-react";

import { Link } from "react-router";
export default function Campaign() {
  return (
    <>
      <SiteHeader title="Campaigns" />
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="container mx-auto py-10">
            <Link to={"new"}>
              <Button type="button" size="default">
                <IconPlus /> Add Campaign
              </Button>
            </Link>

            <div>No Campaigns Found.</div>
          </div>
        </div>
      </div>
    </>
  );
}
