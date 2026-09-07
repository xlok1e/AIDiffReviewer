import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function mergeClassNames(...classValues: ClassValue[]): string {
  return twMerge(clsx(classValues));
}
