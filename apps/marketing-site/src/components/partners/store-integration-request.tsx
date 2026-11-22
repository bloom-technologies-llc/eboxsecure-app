"use client";

import { useState } from "react";
import { submitInquiry } from "@/app/actions/submit-inquiry";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@ebox/ui/button";
import { Container } from "@ebox/ui/container";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@ebox/ui/form";
import { Input } from "@ebox/ui/input";
import { Textarea } from "@ebox/ui/textarea";

const formSchema = z.object({
  name: z.string().trim().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  email: z.string().trim().email({
    message: "Please enter a valid email address.",
  }),
  storeName: z.string().trim().min(2, {
    message: "Please tell us which store you'd like us to add.",
  }),
  storeWebsite: z.string().trim().optional(),
  notes: z.string().trim().optional(),
});

type Status =
  | { kind: "idle" }
  | { kind: "success"; storeName: string }
  | { kind: "error"; message: string };

export function StoreIntegrationRequest() {
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      storeName: "",
      storeWebsite: "",
      notes: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setStatus({ kind: "idle" });
    const result = await submitInquiry({
      type: "integration-request",
      ...values,
    });
    if (result.ok) {
      setStatus({ kind: "success", storeName: values.storeName });
      form.reset();
    } else {
      setStatus({
        kind: "error",
        message: result.error ?? "Something went wrong. Please try again.",
      });
    }
  }

  return (
    <div id="request-a-store" className="bg-muted/50 py-24 sm:py-32">
      <Container>
        <div className="mx-auto max-w-xl">
          <h2 className="text-base font-semibold leading-7 text-primary">
            Don&apos;t see your favorite store?
          </h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-foreground">
            Request a store integration
          </p>
          <p className="mt-4 text-lg leading-8 text-muted-foreground">
            Tell us which retailer you&apos;d like to ship to an EboxSecure
            location from, and we&apos;ll reach out to them about joining our
            network.
          </p>
          <div className="mt-8">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Your name</FormLabel>
                        <FormControl>
                          <Input placeholder="Your name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Your email</FormLabel>
                        <FormControl>
                          <Input placeholder="you@example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="storeName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Store name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="The store you'd like us to add"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="storeWebsite"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Store website (optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="www.store.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Anything else? (optional)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Tell us how often you shop there or what you usually order"
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="submit"
                  className="w-full"
                  disabled={form.formState.isSubmitting}
                >
                  {form.formState.isSubmitting
                    ? "Sending..."
                    : "Request Integration"}
                </Button>
                {status.kind === "success" && (
                  <p role="status" className="text-sm text-green-700">
                    Thanks! We received your request for {status.storeName}.
                  </p>
                )}
                {status.kind === "error" && (
                  <p role="alert" className="text-sm text-destructive">
                    {status.message}
                  </p>
                )}
              </form>
            </Form>
          </div>
        </div>
      </Container>
    </div>
  );
}
