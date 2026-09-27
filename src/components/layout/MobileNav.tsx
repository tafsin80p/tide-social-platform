"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { MessageSquare, Phone, Activity, MoreHorizontal } from "lucide-react";
import { motion } from "framer-motion";

const navItems = [
  { name: "Chat", href: "/", icon: MessageSquare },
  { name: "Calls", href: "/calls", icon: Phone },
  { name: "Status", href: "/status", icon: Activity },
  { name: "More", href: "/settings", icon: MoreHorizontal },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-surface/80 backdrop-blur-lg border-t border-border-subtle z-50 flex items-center justify-around px-2 pb-safe">
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.name}
            href={item.href}
            className="relative flex flex-col items-center justify-center w-16 h-full text-xs font-medium"
          >
            <div
              className={cn(
                "relative z-10 flex flex-col items-center gap-1 transition-colors",
                isActive ? "text-primary" : "text-text-secondary"
              )}
            >
              <item.icon className="w-6 h-6" strokeWidth={isActive ? 2.5 : 2} />
              <span className="scale-90">{item.name}</span>
            </div>
          </Link>
        );
      })}
    </nav>
  );
}
