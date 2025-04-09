"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowLeft,
  AtSign,
  CircleArrowUp,
  MessageCircleWarning,
  Paperclip,
  Pencil,
  Send,
} from "lucide-react";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { Form, FormControl, FormField, FormItem } from "@ebox/ui/form";
import { Textarea } from "@ebox/ui/textarea";

import CommentCard from "~/app/_components/comment-card";

export default function LocationDetail() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const locationName = searchParams.get("name");
  const locationEmail = searchParams.get("email");
  const locationType = searchParams.get("type");
  const locationAddress = searchParams.get("address");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [storeHours, setStoreHours] = useState({
    monday: "9:00 AM - 5:00 PM",
    tuesday: "9:00 AM - 5:00 PM",
    wednesday: "9:00 AM - 5:00 PM",
    thursday: "9:00 AM - 5:00 PM",
    friday: "9:00 AM - 5:00 PM",
    saturday: "10:00 AM - 4:00 PM",
    sunday: "Closed",
  });

  const formSchema = z.object({
    comment: z.string().min(1, {
      message: "Comment cannot be empty.",
    }),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      comment: "",
    },
  });

  return (
    <main className="bg-pageBackground w-full">
      <div className="container w-full py-16 md:w-11/12">
        <div
          className="my-6 flex cursor-pointer items-center gap-x-2"
          onClick={() => router.push("/locations")}
        >
          <ArrowLeft className="h-4 w-4" />
          <p>{locationName}</p>
        </div>
        <div className="grid grid-cols-3 gap-x-6">
          {/* comment section container */}
          <div className="col-span-2 flex flex-col gap-y-2 ">
            <div className="flex flex-col gap-y-6">
              <div className="flex flex-col gap-y-2">
                {/* comment section */}

                <div className="flex flex-col rounded-md  border border-border bg-white">
                  <Form {...form}>
                    <form
                      onSubmit={form.handleSubmit(() => {})}
                      className="rounded-b-none"
                    >
                      <FormField
                        control={form.control}
                        name="comment"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Textarea
                                placeholder="Leave a comment..."
                                className="rounded-none border border-none px-4 py-6"
                                {...field}
                              >
                                <p className="text-gray">Leave a comment...</p>
                              </Textarea>
                            </FormControl>
                          </FormItem>
                        )}
                      ></FormField>
                      <div className="bg-secondary-background flex rounded-md rounded-t-none border-t border-border px-2 py-4">
                        <div className="flex w-full gap-x-2">
                          <AtSign className="h-4 w-4" />
                          <Paperclip className="h-4 w-4" />
                        </div>

                        <Send className="h-4 w-4" />
                      </div>
                    </form>
                  </Form>
                </div>
              </div>

              <div className="flex flex-col gap-y-4">
                <p className="text-gray text-sm">Today</p>
                <div className="flex flex-col gap-y-3">
                  <div className="flex items-center gap-x-2">
                    <MessageCircleWarning className="h-4 w-4" />
                    <p className="text-gray text-sm">
                      Jane Eyre changed this location's email to
                      downtown@ebox.com
                    </p>
                  </div>
                  <CommentCard
                    name={"John Smith"}
                    time={"4:23PM"}
                    comment={"Updated store address information"}
                  />
                  <CommentCard
                    name={"John Smith"}
                    time={"4:23PM"}
                    comment={"Completed store inspection"}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-y-4">
                <p className="text-gray text-sm">Jun 12</p>
                <div className="flex flex-col gap-y-3">
                  <div className="flex items-center gap-x-2">
                    <MessageCircleWarning className="h-4 w-4" />
                    <p className="text-gray text-sm">
                      Jane Eyre updated the location type to {locationType}
                    </p>
                  </div>
                  <CommentCard
                    name={"John Smith"}
                    time={"4:23PM"}
                    comment={"Store renovation completed"}
                  />

                  <CommentCard
                    name={"John Smith"}
                    time={"4:23PM"}
                    comment={"New equipment installation"}
                  />

                  <CommentCard
                    name={"John Smith"}
                    time={"4:23PM"}
                    comment={"Staff training completed"}
                  />

                  <CommentCard
                    name={"John Smith"}
                    time={"4:23PM"}
                    comment={"Grand reopening scheduled"}
                  />
                </div>
              </div>
            </div>

            {/* comments */}
          </div>

          {/* Details Section Container */}
          <div className="flex w-fit flex-col gap-y-6">
            <div className="rounded-lg border border-border bg-white px-6 py-4">
              <div className="flex flex-col gap-y-3">
                <p className="font-medium">Notes</p>
                <div className="flex items-center gap-x-2">
                  <CircleArrowUp className="h-4 w-4" />
                  <p className="text-gray text-sm">High traffic location</p>
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-border bg-white px-2 py-2">
              <iframe
                width="100%"
                height="300"
                referrerPolicy="no-referrer-when-downgrade"
                src={`https://www.google.com/maps/embed/v1/place?key=${process.env.NEXT_PUBLIC_MAPS_EMBED_API_KEY}&q=${locationAddress}`}
                allowFullScreen
              ></iframe>
            </div>

            <div className="rounded-lg border border-border bg-white px-6 py-4">
              <div className="flex flex-col gap-y-6">
                <div className="flex flex-col gap-y-3">
                  <div className="flex items-center">
                    <p className="w-full font-medium">Location</p>
                    <Pencil className="text-gray h-4 w-4" />
                  </div>
                  <p className="text-sm text-secondary">{locationName}</p>
                </div>

                <div className="flex flex-col gap-y-3">
                  <p className="font-medium ">Contact information</p>
                  <p className="text-sm text-secondary">{locationName}</p>
                  <p className="text-gray text-sm">{locationEmail}</p>
                </div>

                <div className="flex flex-col gap-y-3">
                  <p className="font-medium">Location type</p>
                  <p className="text-sm text-secondary">{locationType}</p>
                </div>

                <div className="flex flex-col gap-y-3">
                  <p className="font-medium">Address information</p>
                  <p className="text-sm text-secondary">{locationAddress}</p>
                </div>

                <div className="flex flex-col gap-y-3">
                  <div className="flex items-center">
                    <p className="w-full font-medium">Store Hours</p>
                    <Pencil className="text-gray h-4 w-4" />
                  </div>
                  <div className="text-sm">
                    <div className="flex justify-between">
                      <span>Monday:</span>
                      <span>{storeHours.monday}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tuesday:</span>
                      <span>{storeHours.tuesday}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Wednesday:</span>
                      <span>{storeHours.wednesday}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Thursday:</span>
                      <span>{storeHours.thursday}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Friday:</span>
                      <span>{storeHours.friday}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Saturday:</span>
                      <span>{storeHours.saturday}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Sunday:</span>
                      <span>{storeHours.sunday}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
