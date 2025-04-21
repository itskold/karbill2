import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export const formatDate = (date: Date | undefined): string => {
  if (!date) return "-"
  return new Date(date).toLocaleDateString("fr-FR")
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
