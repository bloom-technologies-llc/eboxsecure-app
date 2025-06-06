"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

interface BackButtonProps {
  orderId: number;
}

export default function BackButton({ orderId }: BackButtonProps) {
  const router = useRouter();

  return (
    <div
      className="my-6 flex cursor-pointer items-center gap-x-2"
      onClick={() => router.push("/orders")}
    >
      <ArrowLeft className="h-4 w-4" />
      <p>#{orderId}</p>
    </div>
  );
}
