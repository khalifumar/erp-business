import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatRupiah(amount: number): string {
  if (isNaN(amount) || amount === null || amount === undefined) return "Rp 0";
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatPercent(value: number): string {
  if (isNaN(value)) return "0%";
  return `${(value * 100).toFixed(1)}%`;
}

export function formatSeconds(seconds: number): string {
  if (!seconds || seconds <= 0) return "0 dtk";
  if (seconds < 60) return `${seconds} dtk`;
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins} mnt ${secs} dtk`;
}
