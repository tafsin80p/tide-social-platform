import { ChatList } from "@/components/chat/ChatList";
import { ChatArea } from "@/components/chat/ChatArea";
import { ContactDetails } from "@/components/chat/ContactDetails";
import { Suspense } from "react";

export default function Home() {
  return (
    <div className="flex w-full h-full overflow-hidden">
      <Suspense fallback={<div>Loading chat list...</div>}>
        <ChatList />
      </Suspense>
      <Suspense fallback={<div>Loading chat area...</div>}>
        <ChatArea />
      </Suspense>
      <Suspense fallback={<div>Loading contact details...</div>}>
        <ContactDetails />
      </Suspense>
    </div>
  );
}
