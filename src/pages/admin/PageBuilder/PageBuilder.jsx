import { SiteHeader } from "@/components/site-header";

import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Card, CardTitle, CardContent, CardHeader } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

// icons
import { SquarePen } from "lucide-react";

export default function PageBuilder() {
  return (
    <>
      <SiteHeader title="Page Builder" />
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="container mx-auto py-10">
            <div className="max-w-4xl">
              
              <div className="rounded-md">
                <div className="bg-accent flex items-center justify-between px-6 py-3">
                  <h2 className="text-lg font-semibold">Hero Section</h2>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="cursor-pointer"
                    >
                      <SquarePen className="h-4 w-4" />
                      Edit
                    </Button>
                  </div>
                </div>
                <FieldGroup className="max-w-xl px-6 pt-4 pb-10">
                  <Field>
                    <FieldLabel htmlFor="page-title">Page Title</FieldLabel>
                    <Input id="page-title" placeholder="Enter page title" />
                    <FieldDescription>
                      Title of the page to be created.
                    </FieldDescription>
                  </Field>

                  <Field>
                    <FieldLabel>Description / Tagline</FieldLabel>
                    <Textarea placeholder="Enter page description or tagline" />
                    <FieldDescription>
                      Description or tagline for the page.
                    </FieldDescription>
                  </Field>

                  <Field>
                    <FieldLabel>Image</FieldLabel>
                    <Input type="file" accept="image/*" />
                  </Field>
                </FieldGroup>
              </div>

              <div className="rounded-md">
                <div className="bg-accent flex items-center justify-between px-6 py-3">
                  <h2 className="text-lg font-semibold">Discounts</h2>
                </div>
                <FieldGroup className="max-w-xl px-6 pt-4 pb-10">
                  <Field>
                    <FieldLabel htmlFor="page-title">Page Title</FieldLabel>
                    <Input id="page-title" placeholder="Enter page title" />
                    <FieldDescription>
                      Title of the page to be created.
                    </FieldDescription>
                  </Field>

                  <Field>
                    <FieldLabel>Description / Tagline</FieldLabel>
                    <Textarea placeholder="Enter page description or tagline" />
                    <FieldDescription>
                      Description or tagline for the page.
                    </FieldDescription>
                  </Field>

                  <Field>
                    <FieldLabel>Image</FieldLabel>
                    <Input type="file" accept="image/*" />
                  </Field>
                </FieldGroup>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
