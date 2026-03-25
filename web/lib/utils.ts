import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPercentile(percentile: number): string {
  return `${percentile}%`
}

export function generateAnonymousId(): string {
  return crypto.randomUUID()
}
