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
import { Accordion } from "radix-ui";

// icons
import { SquarePen, ChevronDown } from "lucide-react";

export default function PageBuilder() {
  return (
    <>
      <SiteHeader title="Page Builder" />
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="container mx-auto py-10">
            <Accordion.Root
              className="max-w-4xl"
              type="single"
              collapsible
              defaultValue="hero-section"
            >
              <Accordion.Item value="hero-section" className="rounded-md">
                <div className="bg-accent flex items-center justify-between px-6 py-3">
                  <h2 className="text-lg font-semibold">Hero Section</h2>
                  <div className="flex items-center gap-2">
                    <Accordion.Trigger
                      className="data-[state=closed]:hidden"
                      disabled
                    >
                      <Button
                        variant="outline"
                        size="sm"
                        className="cursor-pointer"
                      >
                        <SquarePen className="h-4 w-4" />
                        Edit
                      </Button>
                    </Accordion.Trigger>
                    <Accordion.Trigger className="transition-transform duration-300 data-[state=open]:rotate-180">
                      <ChevronDown className="transform" aria-hidden />
                    </Accordion.Trigger>
                  </div>
                </div>
                <Accordion.Content>
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
                </Accordion.Content>
              </Accordion.Item>
            </Accordion.Root>
          </div>
        </div>
      </div>
    </>
  );
}
