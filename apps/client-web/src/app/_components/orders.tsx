"use client";

import { use } from "react";

import type { RouterOutputs } from "@ebox/api";
import { cn } from "@ebox/ui";
import { Button } from "@ebox/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
  useForm,
} from "@ebox/ui/form";
import { Input } from "@ebox/ui/input";
import { toast } from "@ebox/ui/toast";

import { api } from "~/trpc/react";

export function OrdersList() {
  const data = api.order.getAllOrders.useQuery();
  return { data };
}
