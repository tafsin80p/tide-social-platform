import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatOnlineStatus(lastActive: Date | string | undefined | null) {
  if (!lastActive) return "Offline";
  
  const activeDate = new Date(lastActive);
  const now = new Date();
  const diffInMinutes = Math.floor((now.getTime() - activeDate.getTime()) / 60000);

  if (diffInMinutes < 2) return "Online";
  if (diffInMinutes < 60) return `${diffInMinutes}m`;
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays}d`;
  
  return activeDate.toLocaleDateString();
}
