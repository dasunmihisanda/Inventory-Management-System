import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Automatically cleans leading zeros when user types numbers,
 * e.g., typing '5' into '0' produces '5' rather than '05' or '05000'.
 * Preserves decimal points ('0.', '0.5') and clean zeros ('0').
 */
export function handleNumericInput(val: string): string {
  if (val === '') return '';
  return val.replace(/^0+(?=\d)/, '');
}
