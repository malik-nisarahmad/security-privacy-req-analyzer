import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import type { ZodError } from "zod";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatZodError(error: ZodError): Record<string, string> {
  const result: Record<string, string> = {};
  if (error.issues) {
    for (const issue of error.issues) {
      const path = issue.path.join(".") || "root";
      result[path] = issue.message;
    }
  }
  return result;
}
