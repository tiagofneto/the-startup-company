import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getAccessToken() {
  const { hostname } = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL!)
  const projectId = hostname.split('.')[0]

  const storageKey = `sb-${projectId}-auth-token`
  const sessionDataString = localStorage.getItem(storageKey)
  const sessionData = JSON.parse(sessionDataString || 'null')
  const token = sessionData?.access_token

  return token
}

export function computeAvatarFallback(name: string) {
  if (!name) return '';
  
  const words = name.trim().split(/\s+/);

  if (words.length === 1) {
    return name.slice(0, 2);
  } else {
    const firstInitial = words[0][0];
    const lastInitial = words[words.length - 1][0];
    return (firstInitial + lastInitial);
  }
}