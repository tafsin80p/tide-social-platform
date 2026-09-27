import { ChatList } from "@/components/chat/ChatList";
import { ChatArea } from "@/components/chat/ChatArea";
import { ContactDetails } from "@/components/chat/ContactDetails";
import { Suspense } from "react";
import { AppLoader } from "@/components/ui/AppLoader";

export default function Home() {
  return (
    <div className="flex w-full h-full overflow-hidden">
      <Suspense fallback={<div className="w-[350px] flex-shrink-0 border-r border-border-subtle bg-surface flex items-center justify-center"><div className="animate-pulse w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin"></div></div>}>
        <ChatList />
      </Suspense>
      <Suspense fallback={<div className="flex-1 flex flex-col items-center justify-center bg-background"><AppLoader /></div>}>
        <ChatArea />
      </Suspense>
      <Suspense fallback={<div className="w-[320px] flex-shrink-0 border-l border-border-subtle bg-surface"></div>}>
        <ContactDetails />
      </Suspense>
    </div>
  );
}
