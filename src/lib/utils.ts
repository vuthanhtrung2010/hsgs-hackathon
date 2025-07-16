import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import md5 from "md5";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getGravatarURL(email: string, size = 32) {
  const hash = md5(email.trim().toLowerCase());
  return `https://gravatar.com/avatar/${hash}?s=${size}&d=identicon`;
}
