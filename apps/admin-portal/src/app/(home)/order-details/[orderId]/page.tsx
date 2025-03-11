"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
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

import CommentCard from "../../../_components/comment-card";

export default function OrderDetail() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.orderId as string;
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    console.log(values);

    await new Promise((resolve) => setTimeout(resolve, 1000));

    form.reset();
    setIsSubmitting(false);
  }
  return (
    <main className="bg-pageBackground w-full">
      <div className="container h-screen w-full py-16 md:w-11/12">
        <div
          className="my-6 flex cursor-pointer items-center gap-x-2"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-4 w-4" />
          <p>#{orderId}</p>
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
                      onSubmit={form.handleSubmit(onSubmit)}
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
                      Jane Eyre changed this customer’s email
                      hello.kitty@gmail.com
                    </p>
                  </div>
                  <CommentCard
                    name={"John Smith"}
                    time={"4:23PM"}
                    comment={"Customer demanded to speak to corporate"}
                  />
                  <CommentCard
                    name={"John Smith"}
                    time={"4:23PM"}
                    comment={"Customer demanded to speak to corporate"}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-y-4">
                <p className="text-gray text-sm">Jun 12</p>
                <div className="flex flex-col gap-y-3">
                  <div className="flex items-center gap-x-2">
                    <MessageCircleWarning className="h-4 w-4" />
                    <p className="text-gray text-sm">
                      Jane Eyre changed this customer’s email
                      hello.kitty@gmail.com
                    </p>
                  </div>
                  <CommentCard
                    name={"John Smith"}
                    time={"4:23PM"}
                    comment={"Customer demanded to speak to corporate"}
                  />

                  <CommentCard
                    name={"John Smith"}
                    time={"4:23PM"}
                    comment={"Customer demanded to speak to corporate"}
                  />

                  <CommentCard
                    name={"John Smith"}
                    time={"4:23PM"}
                    comment={"Customer demanded to speak to corporate"}
                  />

                  <CommentCard
                    name={"John Smith"}
                    time={"4:23PM"}
                    comment={"Customer demanded to speak to corporate"}
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
                <p className="font-medium">Shipping information</p>
                <div className="flex items-center gap-x-2">
                  <CircleArrowUp className="h-4 w-4" />
                  <p className="text-gray text-sm">Shipping label created</p>
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-border bg-white px-6 py-4">
              <div className="flex flex-col gap-y-6">
                <div className="flex flex-col gap-y-3">
                  <div className="flex items-center">
                    <p className="w-full font-medium">Customer</p>
                    <Pencil className="text-gray h-4 w-4" />
                  </div>
                  <p className="text-sm text-secondary">Jack Black</p>
                </div>

                <div className="flex flex-col gap-y-3">
                  <p className="font-medium ">Contact information</p>
                  <p className="text-sm text-secondary">Jack Black</p>
                  <p className="text-gray text-sm">+1 (123)-456-7890</p>
                </div>

                <div className="flex flex-col gap-y-3">
                  <p className="font-medium">Shipping address</p>
                  <p className="text-gray text-sm">123 apple street</p>
                  <p className="text-gray text-sm">Edison New Jersey 08817</p>
                  <p className="text-gray text-sm">United States</p>
                </div>

                <div className="flex flex-col gap-y-3">
                  <p className="font-medium">Billing address</p>
                  <p className="text-gray text-sm">Same as shipping address</p>
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-border bg-white px-6 py-4">
              <div className="flex flex-col gap-y-3">
                <p className="font-medium">Notes</p>
                <div className="flex items-center gap-x-2">
                  <CircleArrowUp className="h-4 w-4" />
                  <p className="text-gray text-sm">Very friendly</p>
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-border bg-white px-6 py-4">
              <div className="flex flex-col gap-y-3">
                <p className="font-medium">Eligible recipients</p>
                <div className="flex items-center gap-x-2">
                  <CircleArrowUp className="h-4 w-4" />
                  <p className="text-gray text-sm">N/A</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
