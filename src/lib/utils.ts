import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


export function formatNumberPorcentage(value: number): string {
  return `${value.toFixed(2)}%`;
}

export function roundToInteger(value: number): number {
  return Math.round(value);
}