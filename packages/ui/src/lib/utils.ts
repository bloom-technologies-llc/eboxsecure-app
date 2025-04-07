import type { ClassValue } from "clsx";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// TODO: merge this w/ src/index.ts
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
