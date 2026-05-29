import { type ClassValue, clsx } from "clsx";

/**
 * Merge class names using clsx utility.
 * shadcn/ui compatible helper for conditional class merging.
 */
export function cn(...inputs: ClassValue[]) {
  return inputs.filter(Boolean).join(" ");
}

export type { ClassValue };