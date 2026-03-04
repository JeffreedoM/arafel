import { SiteHeader } from "@/components/site-header";

import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel, FieldGroup } from "@/components/ui/field";

export default function NewCampaign() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = (data) => {
    console.log(data);
  };
  return (
    <>
      <SiteHeader title="Campaigns" />
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="container mx-auto py-10">
            <form onSubmit={handleSubmit(onSubmit)}>
              <FieldGroup className="max-w-md">
                <Field>
                  <FieldLabel
                    htmlFor="name"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Campaign Name
                  </FieldLabel>
                  <Input id="name" {...register("name", { required: true })} />
                  {errors.name && (
                    <p className="text-sm text-destructive">
                      This field is required
                    </p>
                  )}
                </Field>

                <Field>
                  <FieldLabel
                    htmlFor="duration"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Duration
                  </FieldLabel>
                  <Input
                    id="duration"
                    {...register("duration", { required: true })}
                  />
                  {errors.duration && (
                    <p className="text-sm text-destructive">
                      This field is required
                    </p>
                  )}
                </Field>

                <Button type="submit">Create Campaign</Button>
              </FieldGroup>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
