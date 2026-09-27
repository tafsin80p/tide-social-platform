import { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { MobileNav } from "./MobileNav";

export function MainLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-screen w-full bg-background overflow-hidden p-0 md:p-4 md:gap-4 relative">
      {/* Background glowing effects for Apple liquid glass look */}
      <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px] pointer-events-none z-0"></div>
      <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[40%] bg-purple-500/20 rounded-full blur-[120px] pointer-events-none z-0"></div>
      
      <div className="relative z-10 h-full flex w-full gap-4">
        <Sidebar />
        <main className="flex-1 flex flex-col min-w-0 relative h-full md:rounded-[2rem] md:overflow-hidden md:bg-surface/80 md:backdrop-blur-3xl md:border md:border-border-subtle md:shadow-2xl">
          {children}
        </main>
      </div>
      <MobileNav />
    </div>
  );
}
